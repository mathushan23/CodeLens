const API_BASE_URL = "http://localhost:5000";

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null ? payload.error || "Request failed" : "Request failed";
    const code = typeof payload === "object" && payload !== null ? payload.code : undefined;
    const error = new Error(message);
    error.status = response.status;
    error.code = code;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  return parseResponse(response);
}

export const getCurrentUser = () => apiRequest("/auth/me");
export const logoutCurrentUser = () => apiRequest("/auth/logout", { method: "POST" });
export const getReviewHistory = () => apiRequest("/api/history");
export const analyzePullRequest = (prUrl) =>
  apiRequest("/api/review/analyze", { method: "POST", body: JSON.stringify({ prUrl }) });
export const getReview = (reviewId) => apiRequest(`/api/review/${reviewId}`);
export const postReviewToPullRequest = (reviewId) =>
  apiRequest(`/api/review/${reviewId}/post-to-pr`, { method: "POST" });
export const getReviewStreamUrl = (reviewId) => `${API_BASE_URL}/api/review/${reviewId}/stream`;
export const getGithubLoginUrl = () => `${API_BASE_URL}/auth/github`;

export async function exportReviewPdf(reviewId) {
  const response = await fetch(`${API_BASE_URL}/api/review/${reviewId}/export`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    return parseResponse(response);
  }

  return response.blob();
}
