import axios from "axios";
import { Octokit } from "@octokit/rest";
import puppeteer from "puppeteer";
import { createReview, findReviewById } from "../models/reviewModel.js";

const MAX_PATCH_LENGTH = 12000;
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

const severityRank = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export const createOctokit = (token = process.env.GITHUB_TOKEN) => new Octokit({ auth: token });

export const parsePrUrl = (url) => {
  const match = url.match(/github\.com\/(.+?)\/(.+?)\/(pull|pulls)\/(\d+)/i);
  if (!match) {
    throw new Error("Invalid GitHub PR URL");
  }

  return {
    owner: match[1],
    repo: match[2],
    prNumber: Number.parseInt(match[4], 10),
  };
};

function hasConfiguredGithubToken() {
  return Boolean(process.env.GITHUB_TOKEN) && !process.env.GITHUB_TOKEN.startsWith("your_");
}

function normalizeIssueType(type = "STYLE") {
  const value = String(type).trim().toUpperCase();
  return ["SECURITY", "BUG", "COMPLEXITY", "STYLE"].includes(value) ? value : "STYLE";
}

function normalizeSeverity(severity = "LOW") {
  const value = String(severity).trim().toUpperCase();
  return ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(value) ? value : "LOW";
}

function buildMetrics(issues) {
  return issues.reduce(
    (metrics, issue) => {
      if (issue.type === "SECURITY") metrics.security += 1;
      if (issue.type === "BUG") metrics.bug += 1;
      if (issue.type === "COMPLEXITY") metrics.complexity += 1;
      if (issue.type === "STYLE") metrics.style += 1;
      return metrics;
    },
    { security: 0, bug: 0, complexity: 0, style: 0 },
  );
}

function computePrimarySeverity(issues) {
  const highest = issues.reduce((current, issue) => {
    return severityRank[issue.severity] > severityRank[current] ? issue.severity : current;
  }, "LOW");

  return highest.toLowerCase();
}

function truncatePatch(patch) {
  if (!patch) {
    return "";
  }

  if (patch.length <= MAX_PATCH_LENGTH) {
    return patch;
  }

  return `${patch.slice(0, MAX_PATCH_LENGTH)}\n...diff truncated for analysis`;
}

function buildDiffPayload(pr, files) {
  return files
    .map((file) =>
      [
        `File: ${file.filename}`,
        `Status: ${file.status}`,
        `Additions: ${file.additions}`,
        `Deletions: ${file.deletions}`,
        "Patch:",
        truncatePatch(file.patch),
      ].join("\n"),
    )
    .join("\n\n---\n\n");
}

function createFallbackAnalysis(pr, files) {
  const issues = [];

  files.forEach((file) => {
    const patch = file.patch || "";
    const lowerPatch = patch.toLowerCase();

    if (lowerPatch.includes("password") || lowerPatch.includes("token")) {
      issues.push({
        type: "SECURITY",
        severity: "HIGH",
        title: "Sensitive value appears in code changes",
        filePath: file.filename,
        lineNumber: 1,
        description: "The diff appears to introduce or manipulate secret-like values directly in source changes.",
        suggestion: "Move secrets to environment variables or a secrets manager and avoid committing them in code.",
      });
    }

    if (!lowerPatch.includes("catch") && lowerPatch.includes("await ")) {
      issues.push({
        type: "BUG",
        severity: "MEDIUM",
        title: "Async flow may be missing explicit error handling",
        filePath: file.filename,
        lineNumber: 1,
        description: "This file contains awaited logic in the diff, but no obvious catch path was found in the patch.",
        suggestion: "Review the async control flow and add explicit error handling where failures should be surfaced.",
      });
    }

    if (file.changes > 250) {
      issues.push({
        type: "COMPLEXITY",
        severity: "MEDIUM",
        title: "Large file delta may be hard to review safely",
        filePath: file.filename,
        lineNumber: 1,
        description: "A large amount of change in one file often hides logic edge cases and makes regressions harder to spot.",
        suggestion: "Consider splitting the change into smaller units or extracting complex logic into smaller functions.",
      });
    }
  });

  const metrics = buildMetrics(issues);
  const score = Math.max(45, 92 - issues.length * 8);

  return {
    score,
    summary:
      issues.length > 0
        ? `Fallback review found ${issues.length} potential issue(s) in ${pr.title}. This result was generated without a completed Claude analysis, so treat it as a first-pass signal rather than a final review.`
        : `Fallback review did not find obvious issues in ${pr.title}. A full AI review would still be valuable before merging.`,
    issues,
    metrics,
  };
}

async function requestClaudeAnalysis(pr, files) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey || apiKey.startsWith("your_")) {
    return null;
  }

  const prompt = [
    "You are an expert code reviewer. Analyze the provided GitHub PR diff.",
    "Return ONLY a valid JSON object with this structure:",
    "{",
    '  "score": <0-100>,',
    '  "summary": "<string>",',
    '  "issues": [{',
    '    "type": "security|bug|complexity|style",',
    '    "severity": "critical|high|medium|low",',
    '    "title": "<string>",',
    '    "file": "<string>",',
    '    "line": <number>,',
    '    "description": "<string>",',
    '    "suggestion": "<string>"',
    "  }],",
    '  "metrics": { "security_issues": <number>, "bug_issues": <number>, "complexity_issues": <number>, "style_issues": <number> }',
    "}",
    "Focus on: SQL injection, XSS, unhandled promises, high cyclomatic complexity, N+1 queries, missing error handling, insecure dependencies.",
    "",
    `PR: ${pr.title}`,
    `Repository: ${pr.base.repo.full_name}`,
    `Branches: ${pr.head.ref} -> ${pr.base.ref}`,
    "",
    buildDiffPayload(pr, files),
  ].join("\n");

  const response = await axios.post(
    "https://api.anthropic.com/v1/messages",
    {
      model: DEFAULT_MODEL,
      max_tokens: 2500,
      temperature: 0.2,
      messages: [{ role: "user", content: prompt }],
    },
    {
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      timeout: 120000,
    },
  );

  const content = response.data?.content?.find((entry) => entry.type === "text")?.text;
  if (!content) {
    throw new Error("Claude response did not contain text content");
  }

  const parsed = JSON.parse(content);
  return { raw: response.data, parsed };
}

function normalizeAnalysisResult(result, files) {
  const normalizedIssues = Array.isArray(result.issues)
    ? result.issues.map((issue) => ({
        type: normalizeIssueType(issue.type),
        severity: normalizeSeverity(issue.severity),
        title: issue.title || "Review issue",
        filePath: issue.file || issue.filePath || files[0]?.filename || "unknown",
        lineNumber: Number(issue.line || issue.lineNumber || 1),
        description: issue.description || "No description provided.",
        suggestion: issue.suggestion || "No suggestion provided.",
        isResolved: false,
      }))
    : [];

  const metrics = result.metrics
    ? {
        security: Number(result.metrics.security_issues ?? result.metrics.security ?? 0),
        bug: Number(result.metrics.bug_issues ?? result.metrics.bug ?? 0),
        complexity: Number(result.metrics.complexity_issues ?? result.metrics.complexity ?? 0),
        style: Number(result.metrics.style_issues ?? result.metrics.style ?? 0),
      }
    : buildMetrics(normalizedIssues);

  return {
    score: Math.max(0, Math.min(100, Number(result.score ?? 0))),
    summary: result.summary || "No summary was returned from analysis.",
    issues: normalizedIssues,
    metrics,
  };
}

function formatReviewResponse(review) {
  const issues = (review.issues || []).map((issue) => ({
    id: issue.id,
    reviewId: issue.reviewId,
    type: String(issue.type).toLowerCase(),
    severity: String(issue.severity).toLowerCase(),
    title: issue.title,
    filePath: issue.filePath,
    lineNumber: issue.lineNumber,
    description: issue.description,
    suggestion: issue.suggestion,
    isResolved: Boolean(issue.isResolved),
    createdAt: issue.createdAt,
  }));

  const normalized = issues.map((issue) => ({
    type: normalizeIssueType(issue.type),
    severity: normalizeSeverity(issue.severity),
  }));

  return {
    id: review.id,
    userId: review.userId,
    prUrl: review.prUrl,
    repoName: review.repoName,
    prNumber: review.prNumber,
    prTitle: review.prTitle,
    branchFrom: review.branchFrom,
    branchTo: review.branchTo,
    score: review.score,
    summary: review.summary,
    filesReviewed: review.filesReviewed,
    linesAdded: review.linesAdded,
    linesRemoved: review.linesRemoved,
    status: String(review.status).toLowerCase(),
    rawResponse: review.rawResponse,
    createdAt: review.createdAt,
    issues,
    metrics: buildMetrics(normalized),
    severity: computePrimarySeverity(normalized),
  };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildReviewComment(review) {
  const issueLines = review.issues.length
    ? review.issues
        .map(
          (issue) =>
            `- **${issue.severity.toUpperCase()}** ${issue.title}\n  - File: \`${issue.filePath}:${issue.lineNumber}\`\n  - ${issue.description}\n  - Suggestion: ${issue.suggestion}`,
        )
        .join("\n")
    : "- No issues were identified in this review.";

  return [
    `## AI Code Review for PR #${review.prNumber}`,
    `**Score:** ${review.score}/100`,
    "",
    review.summary,
    "",
    "### Metrics",
    `- Security: ${review.metrics.security}`,
    `- Bugs: ${review.metrics.bug}`,
    `- Complexity: ${review.metrics.complexity}`,
    `- Style: ${review.metrics.style}`,
    "",
    "### Findings",
    issueLines,
  ].join("\n");
}

function buildReviewHtml(review) {
  const issueCards = review.issues.length
    ? review.issues
        .map(
          (issue) => `
            <section class="issue">
              <div class="badge">${escapeHtml(issue.severity.toUpperCase())}</div>
              <h3>${escapeHtml(issue.title)}</h3>
              <p class="meta">${escapeHtml(issue.filePath)}:${escapeHtml(issue.lineNumber)}</p>
              <p>${escapeHtml(issue.description)}</p>
              <p><strong>Suggestion:</strong> ${escapeHtml(issue.suggestion)}</p>
            </section>
          `,
        )
        .join("")
    : "<p>No issues were identified in this review.</p>";

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; color: #111827; padding: 32px; }
          h1, h2, h3 { margin: 0 0 12px; }
          .meta { color: #6b7280; font-size: 12px; }
          .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
          .card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; }
          .issue { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 16px; }
          .badge { display: inline-block; padding: 6px 10px; border-radius: 999px; background: #111827; color: white; font-size: 11px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <h1>AI Code Review Dashboard</h1>
        <p class="meta">${escapeHtml(review.repoName)} #${escapeHtml(review.prNumber)} | ${escapeHtml(review.branchFrom)} to ${escapeHtml(review.branchTo)}</p>
        <h2>${escapeHtml(review.prTitle)}</h2>
        <p>${escapeHtml(review.summary)}</p>
        <div class="grid">
          <div class="card"><strong>Score</strong><div>${escapeHtml(review.score)}</div></div>
          <div class="card"><strong>Files</strong><div>${escapeHtml(review.filesReviewed)}</div></div>
          <div class="card"><strong>Added</strong><div>${escapeHtml(review.linesAdded)}</div></div>
          <div class="card"><strong>Removed</strong><div>${escapeHtml(review.linesRemoved)}</div></div>
        </div>
        <h2>Findings</h2>
        ${issueCards}
      </body>
    </html>
  `;
}

async function fetchPullRequestContext(prUrl) {
  const { owner, repo, prNumber } = parsePrUrl(prUrl);
  const octokit = createOctokit();
  const [{ data: pr }, { data: files }] = await Promise.all([
    octokit.pulls.get({ owner, repo, pull_number: prNumber }),
    octokit.pulls.listFiles({ owner, repo, pull_number: prNumber, per_page: 100 }),
  ]);

  return { pr, files };
}

async function getAuthorizedReview(reviewId, userId) {
  const review = await findReviewById(reviewId);
  if (!review) {
    return { error: { status: 404, payload: { error: "Review not found", code: "REVIEW_NOT_FOUND" } } };
  }

  if (review.userId !== userId) {
    return { error: { status: 403, payload: { error: "Access denied", code: "REVIEW_FORBIDDEN" } } };
  }

  return { review };
}

export const analyzeReview = async (req, res) => {
  try {
    const prUrl = req.body?.prUrl?.trim();
    if (!prUrl) {
      return res.status(400).json({ error: "PR URL is required", code: "PR_URL_REQUIRED" });
    }

    if (!/^https:\/\/github\.com\/[^/]+\/[^/]+\/pull\/\d+\/?$/i.test(prUrl)) {
      return res.status(400).json({
        error: "Enter a valid GitHub pull request URL like https://github.com/owner/repo/pull/123",
        code: "INVALID_PR_URL",
      });
    }

    if (!hasConfiguredGithubToken()) {
      return res.status(500).json({
        error: "GitHub token is not configured on the backend.",
        code: "GITHUB_TOKEN_NOT_CONFIGURED",
      });
    }

    const { pr, files } = await fetchPullRequestContext(prUrl);
    const fallbackAnalysis = createFallbackAnalysis(pr, files);

    let analysis = fallbackAnalysis;
    let rawResponse = { source: "fallback" };

    try {
      const claudeResponse = await requestClaudeAnalysis(pr, files);
      if (claudeResponse?.parsed) {
        analysis = normalizeAnalysisResult(claudeResponse.parsed, files);
        rawResponse = claudeResponse.raw;
      }
    } catch (error) {
      rawResponse = { source: "fallback", reason: error.message };
    }

    const savedReview = await createReview({
      userId: req.user.id,
      prUrl,
      repoName: pr.base.repo.full_name,
      prNumber: pr.number,
      prTitle: pr.title,
      branchFrom: pr.head.ref,
      branchTo: pr.base.ref,
      score: analysis.score,
      summary: analysis.summary,
      filesReviewed: files.length,
      linesAdded: files.reduce((sum, file) => sum + Number(file.additions || 0), 0),
      linesRemoved: files.reduce((sum, file) => sum + Number(file.deletions || 0), 0),
      status: "DONE",
      rawResponse,
      issues: analysis.issues,
    });

    return res.status(201).json(formatReviewResponse(savedReview));
  } catch (error) {
    if (error.message === "Invalid GitHub PR URL") {
      return res.status(400).json({
        error: "Enter a valid GitHub pull request URL like https://github.com/owner/repo/pull/123",
        code: "INVALID_PR_URL",
      });
    }

    if (error.status === 404) {
      return res.status(404).json({ error: "Pull request not found", code: "PR_NOT_FOUND" });
    }

    return res.status(500).json({ error: "Failed to analyze pull request", code: "REVIEW_ANALYZE_FAILED" });
  }
};

export const getReview = async (req, res) => {
  try {
    const result = await getAuthorizedReview(req.params.id, req.user.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.payload);
    }

    return res.json(formatReviewResponse(result.review));
  } catch {
    return res.status(500).json({ error: "Failed to load review", code: "REVIEW_FETCH_FAILED" });
  }
};

export const streamReview = async (req, res) => {
  try {
    const result = await getAuthorizedReview(req.params.id, req.user.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.payload);
    }

    const review = formatReviewResponse(result.review);
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const words = review.summary.split(/\s+/).filter(Boolean);
    let cursor = 0;
    const intervalId = setInterval(() => {
      if (cursor >= words.length) {
        res.write("event: complete\n");
        res.write('data: {"done":true}\n\n');
        clearInterval(intervalId);
        res.end();
        return;
      }

      res.write("event: chunk\n");
      res.write(`data: ${JSON.stringify({ chunk: words[cursor], cursor })}\n\n`);
      cursor += 1;
    }, 18);

    req.on("close", () => {
      clearInterval(intervalId);
    });
  } catch {
    return res.status(500).json({ error: "Failed to stream review", code: "REVIEW_STREAM_FAILED" });
  }
};

export const exportReview = async (req, res) => {
  let browser;

  try {
    const result = await getAuthorizedReview(req.params.id, req.user.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.payload);
    }

    const review = formatReviewResponse(result.review);
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(buildReviewHtml(review), { waitUntil: "networkidle0" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });
    const pdfBuffer = Buffer.from(pdf);

    if (pdfBuffer.subarray(0, 4).toString() !== "%PDF") {
      throw new Error("Generated file is not a valid PDF document");
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="review-${review.id}.pdf"`);
    return res.send(pdfBuffer);
  } catch (error) {
    console.error("PDF export failed", {
      reviewId: req.params.id,
      userId: req.user?.id,
      message: error.message,
      stack: error.stack,
    });
    return res.status(500).json({
      error: `Failed to export review PDF: ${error.message}`,
      code: "REVIEW_EXPORT_FAILED",
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

export const postReviewToPr = async (req, res) => {
  try {
    const result = await getAuthorizedReview(req.params.id, req.user.id);
    if (result.error) {
      return res.status(result.error.status).json(result.error.payload);
    }

    const review = formatReviewResponse(result.review);
    const [owner, repo] = review.repoName.split("/");
    if (!owner || !repo) {
      return res.status(400).json({ error: "Stored repository name is invalid", code: "INVALID_REPO_NAME" });
    }

    const octokit = createOctokit();
    const comment = await octokit.issues.createComment({
      owner,
      repo,
      issue_number: review.prNumber,
      body: buildReviewComment(review),
    });

    return res.json({
      success: true,
      commentUrl: comment.data.html_url,
      message: "Review comment posted to GitHub pull request.",
    });
  } catch (error) {
    const providerMessage =
      error.response?.data?.message || error.response?.data?.error || error.message || "Unknown GitHub API error";

    console.error("Post to PR failed", {
      reviewId: req.params.id,
      userId: req.user?.id,
      message: providerMessage,
      status: error.status || error.response?.status,
      response: error.response?.data,
      stack: error.stack,
    });
    return res.status(500).json({
      error: `Failed to post review to pull request: ${providerMessage}`,
      code: "REVIEW_POST_FAILED",
    });
  }
};
