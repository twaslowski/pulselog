"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ContinuousMetricSpecificationProps {
  onBack: () => void;
  onSubmit: (minValue: number, maxValue: number) => void;
  isSubmitting: boolean;
}

export default function ContinuousMetricSpecification({
  onBack,
  onSubmit,
  isSubmitting,
}: ContinuousMetricSpecificationProps) {
  const [minValue, setMinValue] = useState<number | null>(null);
  const [maxValue, setMaxValue] = useState<number | null>(null);

  const handleSubmit = () => {
    if (minValue !== null && maxValue !== null) {
      onSubmit(minValue, maxValue);
    }
  };

  const canProceed =
    minValue !== null && maxValue !== null && minValue < maxValue;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Set the value range</h3>
        <p className="text-sm text-muted-foreground mb-4">
          What&apos;s the minimum and maximum value you might record?
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minValue">Minimum Value</Label>
          <Input
            id="minValue"
            aria-label="set-min-value"
            type="number"
            placeholder="e.g., 0"
            value={minValue ?? ""}
            onChange={(e) =>
              setMinValue(e.target.value ? parseFloat(e.target.value) : null)
            }
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxValue">Maximum Value</Label>
          <Input
            id="maxValue"
            aria-label="set-max-value"
            type="number"
            placeholder="e.g., 24"
            value={maxValue ?? ""}
            onChange={(e) =>
              setMaxValue(e.target.value ? parseFloat(e.target.value) : null)
            }
          />
        </div>
      </div>
      <div className="flex justify-between gap-2 mt-6">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button
          aria-label="submit-metric"
          onClick={handleSubmit}
          disabled={!canProceed || isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Metric"}
        </Button>
      </div>
    </div>
  );
}
