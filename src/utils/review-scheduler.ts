const REVIEW_DAYS = [1, 1, 3, 7, 14, 30] as const;

export function scheduleReview(currentMastery: number, isCorrect: boolean, now = new Date()) {
  const masteryLevel = isCorrect ? Math.min(5, currentMastery + 1) : Math.max(0, currentMastery - 1);
  const reviewDays = isCorrect ? (REVIEW_DAYS[masteryLevel] ?? 30) : 1;
  const nextReviewAt = new Date(now.getTime() + reviewDays * 86_400_000);
  return { masteryLevel, nextReviewAt: nextReviewAt.toISOString() };
}
