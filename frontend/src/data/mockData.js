export const authUser = {
  name: "Nora Bennet",
  handle: "@nora.codes",
  avatarUrl:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80",
};

export const sampleReview = {
  id: "review_204",
  prUrl: "https://github.com/open-source/atlas/pull/418",
  repoName: "open-source/atlas",
  prNumber: 418,
  prTitle: "Refactor webhook dispatch and invoice reconciliation flow",
  branchFrom: "feature/reconcile-retries",
  branchTo: "main",
  score: 74,
  status: "done",
  filesReviewed: 12,
  linesAdded: 482,
  linesRemoved: 173,
  createdAt: "2026-06-04T19:20:00.000Z",
  summary:
    "The pull request moves the billing workflow in a healthier direction, but the retry path still mixes persistence and network side effects inside the same transaction. Claude found one critical trust-boundary issue in webhook verification and a pair of high-severity reliability bugs around promise handling and duplicate invoice writes. The overall design is promising, yet the data access layer needs stronger guards before this should merge.",
  metrics: {
    security: 1,
    bug: 3,
    complexity: 2,
    style: 4,
  },
  issues: [
    {
      id: "issue_1",
      type: "security",
      severity: "critical",
      title: "Webhook signature check trusts a nullable secret",
      filePath: "server/routes/webhooks.js",
      lineNumber: 84,
      description:
        "The verification branch falls back to an empty string when WEBHOOK_SECRET is missing. That makes forged requests appear valid in non-production deployments and creates drift between environments.",
      suggestion:
        "Fail fast during boot when the secret is absent and reject webhook traffic until configuration is complete.",
    },
    {
      id: "issue_2",
      type: "bug",
      severity: "high",
      title: "Retry queue can create duplicate invoices",
      filePath: "server/services/reconcileInvoices.js",
      lineNumber: 142,
      description:
        "The worker inserts the invoice row before confirming whether a previous retry already completed. Under concurrent retries, the same invoice can be persisted twice.",
      suggestion:
        "Add an idempotency check keyed by provider invoice id and enforce it with a unique database constraint.",
    },
    {
      id: "issue_3",
      type: "bug",
      severity: "high",
      title: "Async mapper drops promise failures",
      filePath: "server/services/dispatchEvents.js",
      lineNumber: 57,
      description:
        "The code awaits Promise.all on a list built from a conditional mapper that sometimes returns undefined. Failed dispatches become hard to trace and partial sends look successful.",
      suggestion:
        "Normalize the mapper to always return promises and capture per-target failures before resolving the batch.",
    },
    {
      id: "issue_4",
      type: "complexity",
      severity: "medium",
      title: "Controller branches exceed maintainable depth",
      filePath: "server/controllers/billingController.js",
      lineNumber: 203,
      description:
        "The request handler nests validation, reconciliation, retry planning, and event publication in one function. It is difficult to reason about transaction boundaries.",
      suggestion:
        "Split the workflow into focused service steps and keep the controller responsible for request mapping and response shaping.",
    },
    {
      id: "issue_5",
      type: "style",
      severity: "low",
      title: "Repeated severity labels are hard-coded in multiple files",
      filePath: "client/components/IssueRow.jsx",
      lineNumber: 16,
      description:
        "Duplicated labels and classes make visual updates error-prone and drift from the rest of the dashboard palette.",
      suggestion:
        "Extract severity metadata into a shared map used by badges, bars, and issue cards.",
    },
  ],
};

export const historyItems = [
  {
    id: "review_204",
    createdAt: "2026-06-04T19:20:00.000Z",
    repoName: "open-source/atlas",
    prTitle: "Refactor webhook dispatch and invoice reconciliation flow",
    severity: "critical",
    score: 74,
    status: "done",
    issues: 5,
  },
  {
    id: "review_191",
    createdAt: "2026-06-03T17:05:00.000Z",
    repoName: "payments/starlight",
    prTitle: "Introduce cache-backed entitlement checks",
    severity: "high",
    score: 81,
    status: "done",
    issues: 3,
  },
  {
    id: "review_176",
    createdAt: "2026-06-01T11:42:00.000Z",
    repoName: "docs/guidebook",
    prTitle: "Rewrite onboarding page content pipeline",
    severity: "medium",
    score: 89,
    status: "done",
    issues: 4,
  },
  {
    id: "review_155",
    createdAt: "2026-05-28T09:18:00.000Z",
    repoName: "ai/lighthouse",
    prTitle: "Batch prompt logging for experiment runs",
    severity: "low",
    score: 92,
    status: "done",
    issues: 2,
  },
];
