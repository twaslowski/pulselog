import { MetricTracking, MetricTrackingSchema } from "@/types/tracking";
import { z } from "zod";

export async function getTrackedMetrics(): Promise<MetricTracking[]> {
  const response = await fetch("/api/v1/tracking", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || "Failed to fetch entries");
  }

  const { success, error, data } = await response
    .json()
    .then((json) => z.array(MetricTrackingSchema).safeParse(json));

  if (!success) {
    console.warn("Failed to parse tracked metrics:", error);
    throw new Error("Could not parse response from server.");
  }

  return data;
}
