import { useEffect, useRef, useState } from "react";
import {
  analyzePullRequest,
  exportReviewPdf,
  getReview,
  getReviewHistory,
  getReviewStreamUrl,
  postReviewToPullRequest,
} from "../api/client";

function toHistoryItem(review) {
  return {
    id: review.id,
    createdAt: review.createdAt,
    repoName: review.repoName,
    prTitle: review.prTitle,
    prUrl: review.prUrl,
    prNumber: review.prNumber,
    score: review.score,
    status: review.status,
    severity: review.severity || "low",
    issues: review.issues?.length ?? 0,
  };
}

export function useReview({ isAuthenticated }) {
  const [prUrl, setPrUrl] = useState("");
  const [review, setReview] = useState(null);
  const [history, setHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedSummary, setStreamedSummary] = useState("");
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const eventSourceRef = useRef(null);
  const actionToastTimeoutRef = useRef(null);

  const clearActionToastTimeout = () => {
    if (actionToastTimeoutRef.current) {
      clearTimeout(actionToastTimeoutRef.current);
      actionToastTimeoutRef.current = null;
    }
  };

  const showActionToast = ({ message = "", error = "" }) => {
    clearActionToastTimeout();
    setActionMessage(message);
    setActionError(error);

    if (message || error) {
      actionToastTimeoutRef.current = setTimeout(() => {
        setActionMessage("");
        setActionError("");
        actionToastTimeoutRef.current = null;
      }, 4500);
    }
  };

  const closeStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  };

  const openStream = (reviewId, fallbackSummary) => {
    closeStream();
    setIsStreaming(true);
    setStreamedSummary("");

    const stream = new EventSource(getReviewStreamUrl(reviewId), { withCredentials: true });
    eventSourceRef.current = stream;

    stream.addEventListener("chunk", (event) => {
      try {
        const payload = JSON.parse(event.data);
        setStreamedSummary((current) => (current ? `${current} ${payload.chunk}` : payload.chunk));
      } catch {
        setStreamedSummary(fallbackSummary);
      }
    });

    stream.addEventListener("complete", () => {
      setIsStreaming(false);
      closeStream();
      setStreamedSummary((current) => current || fallbackSummary);
    });

    stream.onerror = () => {
      setIsStreaming(false);
      closeStream();
      setStreamedSummary(fallbackSummary);
    };
  };

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      if (!isAuthenticated) {
        closeStream();
        setReview(null);
        setPrUrl("");
        setStreamedSummary("");
        setHistory([]);
        setHistoryError("");
        setHistoryLoading(false);
        return;
      }

      setHistoryLoading(true);
      setHistoryError("");

      try {
        const items = await getReviewHistory();
        if (isMounted) {
          setHistory(items);
        }
      } catch (error) {
        if (isMounted) {
          setHistory([]);
          setHistoryError(error.message || "Failed to load history");
        }
      } finally {
        if (isMounted) {
          setHistoryLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
      closeStream();
      clearActionToastTimeout();
    };
  }, [isAuthenticated]);

  const startReview = async (nextUrl) => {
    const safeUrl = nextUrl?.trim() || "";
    setPrUrl(safeUrl);
    setReviewError("");
    showActionToast({});

    if (!isAuthenticated) {
      setReviewError("Sign in with GitHub before analyzing a pull request.");
      return;
    }

    if (!safeUrl) {
      setReviewError("Paste a GitHub pull request URL before analyzing.");
      return;
    }

    setIsProcessing(true);

    try {
      const analyzedReview = await analyzePullRequest(safeUrl);
      setReview(analyzedReview);
      setHistory((currentHistory) => {
        const nextItem = toHistoryItem(analyzedReview);
        const deduped = currentHistory.filter((item) => item.id !== nextItem.id);
        return [nextItem, ...deduped];
      });
      openStream(analyzedReview.id, analyzedReview.summary);
    } catch (error) {
      setReviewError(error.message || "Failed to analyze pull request");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadReview = async (reviewId) => {
    if (!isAuthenticated) {
      setReviewError("Sign in with GitHub before opening saved reviews.");
      return false;
    }

    setReviewError("");
    showActionToast({});
    setIsProcessing(true);

    try {
      const loadedReview = await getReview(reviewId);
      setReview(loadedReview);
      setPrUrl(loadedReview.prUrl || "");
      setStreamedSummary(loadedReview.summary || "");
      setIsStreaming(false);
      closeStream();
      return true;
    } catch (error) {
      setReviewError(error.message || "Failed to load saved review");
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const exportCurrentReview = async () => {
    if (!review) {
      showActionToast({ error: "Analyze or open a review before exporting." });
      return;
    }

    showActionToast({});
    setIsExporting(true);

    try {
      const blob = await exportReviewPdf(review.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `review-${review.id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      showActionToast({ message: "Review PDF downloaded." });
    } catch (error) {
      showActionToast({ error: error.message || "Failed to export review" });
    } finally {
      setIsExporting(false);
    }
  };

  const postCurrentReview = async () => {
    if (!review) {
      showActionToast({ error: "Analyze or open a review before posting." });
      return;
    }

    showActionToast({});
    setIsPosting(true);

    try {
      const result = await postReviewToPullRequest(review.id);
      showActionToast({ message: result.message || "Review posted to GitHub." });
    } catch (error) {
      showActionToast({ error: error.message || "Failed to post review to GitHub" });
    } finally {
      setIsPosting(false);
    }
  };

  const dismissActionToast = () => {
    clearActionToastTimeout();
    setActionMessage("");
    setActionError("");
  };

  return {
    actionError,
    actionMessage,
    dismissActionToast,
    exportCurrentReview,
    history,
    historyError,
    historyLoading,
    isExporting,
    isPosting,
    isProcessing,
    isStreaming,
    loadReview,
    postCurrentReview,
    prUrl,
    review,
    reviewError,
    startReview,
    streamedSummary,
  };
}
