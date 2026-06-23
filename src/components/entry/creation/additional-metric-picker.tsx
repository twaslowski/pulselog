"use client";

import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import React from "react";
import AdditionalMetricPickerDialog from "@/components/entry/creation/additional-metric-picker-dialog";
import { Metric } from "@/types/metric";

export function AdditionalMetricPicker({
  addAdditionalMetric,
  excludedMetricIds,
}: {
  addAdditionalMetric: (metric: Metric) => void;
  excludedMetricIds?: string[];
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <>
      <Button
        variant="ghost"
        className="w-full mt-4"
        onClick={() => setIsOpen(true)}
      >
        <PlusIcon />
        Add Metric
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-2xl">
            <AdditionalMetricPickerDialog
              onComplete={(metric) => {
                addAdditionalMetric(metric);
                setIsOpen(false);
              }}
              onClose={() => setIsOpen(false)}
              excludedMetricIds={excludedMetricIds}
            />
          </div>
        </div>
      )}
    </>
  );
}
