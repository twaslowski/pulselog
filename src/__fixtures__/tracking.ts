import { MetricTracking } from "@/types/tracking";
import { mood, sleep, exercise } from "./metric";

export const moodTracking: MetricTracking = {
  userId: "user-123",
  trackedAt: new Date(),
  baseline: 0,
  metric: mood,
};

export const sleepTracking: MetricTracking = {
  userId: "user-123",
  trackedAt: new Date(),
  baseline: 8,
  metric: sleep,
};

export const exerciseTracking: MetricTracking = {
  userId: "user-123",
  trackedAt: new Date(),
  baseline: 30,
  metric: exercise,
};
