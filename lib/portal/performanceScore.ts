export type PracticePerformanceScoreFactors = {
  previousMonthTurnaround: number;
  previousMonthOrderTrend: number;
  previousMonthOfficeRemakes: number;
  previousMonthLabRemakes: number;
};

export function scorePreviousMonthTurnaround(days: number) {
  if (days >= 1 && days <= 3) return 100;
  if (days > 3 && days <= 5) return 75;
  if (days > 5 && days <= 7) return 50;
  return 25;
}

export function scorePreviousMonthOrderTrend(percentOfPriorMonth: number) {
  if (percentOfPriorMonth > 110) return 100;
  if (percentOfPriorMonth > 100) return 75;
  if (percentOfPriorMonth >= 80) return 50;
  return 25;
}

export function scorePreviousMonthOfficeRemakes(percent: number) {
  if (percent < 8) return 100;
  if (percent <= 10) return 75;
  if (percent <= 14) return 50;
  if (percent <= 20) return 25;
  return 5;
}

export function scorePreviousMonthLabRemakes(percent: number) {
  if (percent <= 1.25) return 100;
  if (percent <= 2) return 75;
  if (percent <= 3) return 50;
  if (percent <= 5) return 25;
  return 5;
}

export function calculatePracticePerformanceScore(
  factors: PracticePerformanceScoreFactors
) {
  const scores = {
    previousMonthTurnaround: scorePreviousMonthTurnaround(
      factors.previousMonthTurnaround
    ),
    previousMonthOrderTrend: scorePreviousMonthOrderTrend(
      factors.previousMonthOrderTrend
    ),
    previousMonthOfficeRemakes: scorePreviousMonthOfficeRemakes(
      factors.previousMonthOfficeRemakes
    ),
    previousMonthLabRemakes: scorePreviousMonthLabRemakes(
      factors.previousMonthLabRemakes
    ),
  };

  return {
    score: Math.round(
      Object.values(scores).reduce((total, value) => total + value, 0) /
        Object.values(scores).length
    ),
    factors: scores,
  };
}

