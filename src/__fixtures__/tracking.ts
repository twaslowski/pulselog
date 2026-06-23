import { MetricTracking } from "@/types/tracking";
import { mood, sleep, exercise, waterIntake } from "./metric";

export const moodTracking: MetricTracking = {
  userId: "user-123",
  trackedAt: "2025-11-05T10:00:00.000Z",
  baseline: 0,
  metric: mood,
};

export const sleepTracking: MetricTracking = {
  userId: "user-123",
  trackedAt: "2025-11-05T10:00:00.000Z",
  baseline: 8,
  metric: sleep,
};

export const exerciseTracking: MetricTracking = {
  userId: "user-123",
  trackedAt: "2025-11-05T10:00:00.000Z",
  baseline: 30,
  metric: exercise,
};
