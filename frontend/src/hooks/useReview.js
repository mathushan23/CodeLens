import { useEffect, useState } from "react";
import { historyItems, sampleReview } from "../data/mockData";

const defaultUrl = sampleReview.prUrl;

export function useReview() {
  const [prUrl, setPrUrl] = useState(defaultUrl);
  const [review, setReview] = useState(sampleReview);
  const [history] = useState(historyItems);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamedSummary, setStreamedSummary] = useState(sampleReview.summary);

  useEffect(() => {
    if (!isStreaming) {
      return undefined;
    }

    const words = review.summary.split(" ");
    let cursor = 0;
    setStreamedSummary("");

    const intervalId = window.setInterval(() => {
      cursor += 1;
      setStreamedSummary(words.slice(0, cursor).join(" "));

      if (cursor >= words.length) {
        window.clearInterval(intervalId);
        setIsStreaming(false);
      }
    }, 32);

    return () => window.clearInterval(intervalId);
  }, [isStreaming, review.summary]);

  const startReview = (nextUrl) => {
    const safeUrl = nextUrl?.trim() || defaultUrl;
    setPrUrl(safeUrl);
    setIsProcessing(true);

    window.setTimeout(() => {
      setReview({
        ...sampleReview,
        prUrl: safeUrl,
        createdAt: new Date().toISOString(),
      });
      setIsProcessing(false);
      setIsStreaming(true);
    }, 1500);
  };

  return {
    history,
    isProcessing,
    isStreaming,
    prUrl,
    review,
    startReview,
    streamedSummary,
  };
}
