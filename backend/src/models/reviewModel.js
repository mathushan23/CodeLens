import { getConnection, query } from "./db.js";

export const createReview = async (data) => {
  const connection = await getConnection();

  try {
    await connection.beginTransaction();

    const [reviewResult] = await connection.execute(
      `INSERT INTO reviews (
        user_id,
        pr_url,
        repo_name,
        pr_number,
        pr_title,
        branch_from,
        branch_to,
        score,
        summary,
        files_reviewed,
        lines_added,
        lines_removed,
        status,
        raw_response
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.userId,
        data.prUrl,
        data.repoName,
        data.prNumber,
        data.prTitle,
        data.branchFrom,
        data.branchTo,
        data.score ?? 0,
        data.summary ?? "",
        data.filesReviewed ?? 0,
        data.linesAdded ?? 0,
        data.linesRemoved ?? 0,
        data.status ?? "PENDING",
        data.rawResponse ? JSON.stringify(data.rawResponse) : null,
      ],
    );

    const reviewId = reviewResult.insertId;

    if (Array.isArray(data.issues) && data.issues.length > 0) {
      for (const issue of data.issues) {
        await connection.execute(
          `INSERT INTO issues (
            review_id,
            type,
            severity,
            title,
            file_path,
            line_number,
            description,
            suggestion,
            is_resolved
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            reviewId,
            issue.type,
            issue.severity,
            issue.title,
            issue.filePath,
            issue.lineNumber,
            issue.description,
            issue.suggestion,
            issue.isResolved ?? false,
          ],
        );
      }
    }

    await connection.commit();
    return findReviewById(reviewId);
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const findReviewById = async (id) => {
  const reviewRows = await query(
    `SELECT
      id,
      user_id AS userId,
      pr_url AS prUrl,
      repo_name AS repoName,
      pr_number AS prNumber,
      pr_title AS prTitle,
      branch_from AS branchFrom,
      branch_to AS branchTo,
      score,
      summary,
      files_reviewed AS filesReviewed,
      lines_added AS linesAdded,
      lines_removed AS linesRemoved,
      status,
      raw_response AS rawResponse,
      created_at AS createdAt
    FROM reviews
    WHERE id = ?
    LIMIT 1`,
    [Number(id)],
  );

  const review = reviewRows[0];
  if (!review) {
    return null;
  }

  const issues = await query(
    `SELECT
      id,
      review_id AS reviewId,
      type,
      severity,
      title,
      file_path AS filePath,
      line_number AS lineNumber,
      description,
      suggestion,
      is_resolved AS isResolved,
      created_at AS createdAt
    FROM issues
    WHERE review_id = ?
    ORDER BY created_at ASC`,
    [Number(id)],
  );

  return { ...review, issues };
};

export const findReviewsByUserId = async (userId) => {
  return query(
    `SELECT
      r.id,
      r.user_id AS userId,
      r.pr_url AS prUrl,
      r.repo_name AS repoName,
      r.pr_number AS prNumber,
      r.pr_title AS prTitle,
      r.branch_from AS branchFrom,
      r.branch_to AS branchTo,
      r.score,
      r.summary,
      r.files_reviewed AS filesReviewed,
      r.lines_added AS linesAdded,
      r.lines_removed AS linesRemoved,
      r.status,
      r.raw_response AS rawResponse,
      r.created_at AS createdAt,
      COUNT(i.id) AS issueCount,
      COALESCE(
        CASE MAX(
          CASE i.severity
            WHEN 'CRITICAL' THEN 4
            WHEN 'HIGH' THEN 3
            WHEN 'MEDIUM' THEN 2
            WHEN 'LOW' THEN 1
            ELSE 0
          END
        )
          WHEN 4 THEN 'critical'
          WHEN 3 THEN 'high'
          WHEN 2 THEN 'medium'
          WHEN 1 THEN 'low'
          ELSE 'low'
        END,
        'low'
      ) AS severity
    FROM reviews r
    LEFT JOIN issues i ON i.review_id = r.id
    WHERE r.user_id = ?
    GROUP BY
      r.id,
      r.user_id,
      r.pr_url,
      r.repo_name,
      r.pr_number,
      r.pr_title,
      r.branch_from,
      r.branch_to,
      r.score,
      r.summary,
      r.files_reviewed,
      r.lines_added,
      r.lines_removed,
      r.status,
      r.raw_response,
      r.created_at
    ORDER BY r.created_at DESC`,
    [Number(userId)],
  );
};
