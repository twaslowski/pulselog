"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Trash2 } from "lucide-react";

interface DiscreteMetricSpecificationProps {
  onBack: () => void;
  onSubmit: (labels: Record<string, number>) => void;
  isSubmitting: boolean;
  initialLabels?: Record<string, number>;
}

export default function DiscreteMetricSpecification({
  onBack,
  onSubmit,
  isSubmitting,
  initialLabels,
}: DiscreteMetricSpecificationProps) {
  const [labels, setLabels] = useState<string[]>(() => {
    if (!initialLabels || Object.keys(initialLabels).length === 0) {
      return [""];
    }
    // Sort by value descending to reconstruct the original order (best to worst)
    return Object.entries(initialLabels)
      .sort(([, a], [, b]) => b - a)
      .map(([label]) => label);
  });
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 0);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    updateScrollIndicators();
  }, [labels.length, updateScrollIndicators]);

  const addLabel = () => {
    setLabels([...labels, ""]);
  };

  const updateLabel = (index: number, value: string) => {
    const newLabels = [...labels];
    newLabels[index] = value;
    setLabels(newLabels);
    // Clear error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const removeLabel = (index: number) => {
    if (labels.length > 1) {
      setLabels(labels.filter((_, i) => i !== index));
    }
  };

  const moveLabel = (fromIndex: number, toIndex: number) => {
    const newLabels = [...labels];
    const [movedLabel] = newLabels.splice(fromIndex, 1);
    newLabels.splice(toIndex, 0, movedLabel);
    setLabels(newLabels);
    setDraggedIndex(null);
  };

  const handleSubmit = () => {
    const filledLabels = labels.filter((label) => label.trim() !== "");

    // Check for duplicate labels (case-insensitive)
    const normalizedLabels = filledLabels.map((label) =>
      label.trim().toLowerCase(),
    );
    const uniqueLabels = new Set(normalizedLabels);

    if (uniqueLabels.size !== normalizedLabels.length) {
      setError("Duplicate labels found. Each label must be unique.");
      return;
    }

    // Clear any previous errors
    setError(null);

    const result: Record<string, number> = {};

    // Assign values in descending order (best to worst)
    // First label (best) gets the highest value
    filledLabels.forEach((label, index) => {
      result[label] = filledLabels.length - index;
    });

    onSubmit(result);
  };

  const canProceed = labels.some((label) => label.trim() !== "");

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Define your options</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Create labels and sort them from best to worst, if possible.
        </p>
      </div>
      <div className="relative">
        {canScrollUp && (
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        )}
        <div
          ref={scrollRef}
          onScroll={updateScrollIndicators}
          className="space-y-2 max-h-64 overflow-y-auto"
        >
          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {labels.map((label, index) => (
            <div
              key={index}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (draggedIndex !== null && draggedIndex !== index) {
                  moveLabel(draggedIndex, index);
                }
              }}
              onDragEnd={() => setDraggedIndex(null)}
              className={`flex gap-2 items-center p-3 rounded border transition-colors ${
                draggedIndex === index
                  ? "opacity-50 bg-muted"
                  : "hover:bg-muted/50"
              }`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
              <div className="flex-1">
                <Input
                  placeholder="e.g., Happy, Sad, Neutral"
                  value={label}
                  onChange={(e) => updateLabel(index, e.target.value)}
                  className="h-9"
                  aria-label="input-label-name"
                />
              </div>
              {labels.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeLabel(index)}
                  className="h-9 w-9 shrink-0"
                  aria-label="remove-label"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {canScrollDown && (
          <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        )}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={addLabel}
        className="w-full"
      >
        + Add Another Option
      </Button>
      <div className="flex justify-between gap-2 mt-6">
        <Button onClick={onBack} variant="outline">
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={!canProceed || isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Metric"}
        </Button>
      </div>
    </div>
  );
}
