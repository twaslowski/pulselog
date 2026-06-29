export function extractBounds(metricData: {
  labels: Record<string, number>;
  minValue: number | null;
  maxValue: number | null;
}) {
  const labels = Object.values(metricData.labels);
  const hasLabels = labels.length > 0;
  const labelsMin = hasLabels ? Math.min(...labels) : null;
  const labelsMax = hasLabels ? Math.max(...labels) : null;

  if (
    hasLabels &&
    metricData.minValue !== null &&
    labelsMin! < metricData.minValue
  ) {
    throw new Error("Labels contain values below the specified minValue");
  }
  if (
    hasLabels &&
    metricData.maxValue !== null &&
    labelsMax! > metricData.maxValue
  ) {
    throw new Error("Labels contain values above the specified maxValue");
  }

  let minValue = metricData.minValue;
  let maxValue = metricData.maxValue;

  if (metricData.minValue === null) {
    if (hasLabels) {
      minValue = labelsMin;
    }
  }

  if (metricData.maxValue === null) {
    if (hasLabels) {
      maxValue = labelsMax;
    }
  }

  if (minValue === null || maxValue === null) {
    throw new Error("Metric bounds must be provided or inferred from labels");
  }

  return { minValue, maxValue };
}
