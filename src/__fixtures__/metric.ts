import { Metric } from "@/types/metric";

export const mood: Metric = {
  id: crypto.randomUUID(),
  name: "Mood",
  description: "Daily mood rating",
  metricType: "discrete",
  labels: {
    Depressed: -1,
    Neutral: 0,
    Happy: 1,
  },
  creationTimestamp: new Date(),
  updateTimestamp: new Date(),
  ownerId: "SYSTEM",
  minValue: -1,
  maxValue: 1,
};

export const sleep: Metric = {
  id: crypto.randomUUID(),
  name: "Sleep Duration",
  description: "Hours of sleep",
  metricType: "continuous",
  labels: {},
  creationTimestamp: new Date(),
  updateTimestamp: new Date(),
  ownerId: "SYSTEM",
  minValue: 0,
  maxValue: 24,
};

export const exercise: Metric = {
  id: crypto.randomUUID(),
  name: "Exercise Minutes",
  description: "Minutes of exercise",
  metricType: "continuous",
  labels: {},
  creationTimestamp: new Date(),
  updateTimestamp: new Date(),
  ownerId: "user-123",
  minValue: 0,
  maxValue: 180,
};

export const waterIntake: Metric = {
  id: crypto.randomUUID(),
  name: "Water Intake",
  description: "Glasses of water",
  metricType: "continuous",
  labels: {},
  creationTimestamp: new Date(),
  updateTimestamp: new Date(),
  ownerId: "user-123",
  minValue: 0,
  maxValue: 12,
};
