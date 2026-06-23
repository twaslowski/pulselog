"use client";

import React, { useState } from "react";
import { type Entry } from "@/types/entry";
import { type EntryValue, EntryValueSchema } from "@/types/entry-value";
import { type Metric } from "@/types/metric";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XIcon, Save } from "lucide-react";
import ValueSelect from "@/components/entry/value-select";
import { updateEntry } from "@/app/actions/entry";
import toast from "react-hot-toast";
import { extractErrorMessage } from "@/lib/utils";
import { CheckIcon } from "lucide-react";
import { AdditionalMetricPicker } from "@/components/entry/creation/additional-metric-picker";

interface EntryEditDialogProps {
  entry: Entry;
  onClose: () => void;
  onComplete?: () => void;
}

export default function EntryEditDialog({
  entry,
  onClose,
  onComplete,
}: EntryEditDialogProps) {
  const [recordedAt, setRecordedAt] = useState(
    new Date(entry.recorded_at).toISOString().slice(0, 16),
  );

  const initialValues: Record<string, number> = {};
  entry.values.forEach((value) => {
    initialValues[value.metric.id] = value.value;
  });

  const [submittedValues, setSubmittedValues] =
    useState<Record<string, number>>(initialValues);
  const [comment, setComment] = useState(entry.comment || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [metrics, setMetrics] = useState<Metric[]>(
    entry.values.map((v) => v.metric),
  );

  const handleSubmittedValue = (metricId: string, value: number) => {
    setSubmittedValues((prev) => ({
      ...prev,
      [metricId]: value,
    }));
  };

  const removeMetric = (metricId: string) => {
    setMetrics((prev) => prev.filter((m) => m.id !== metricId));
    setSubmittedValues((prev) => {
      const updated = { ...prev };
      delete updated[metricId];
      return updated;
    });
  };

  const deriveEntryValues = (): EntryValue[] => {
    return Object.entries(submittedValues)
      .filter(([, value]) => value !== undefined)
      .map(([metricId, value]) =>
        EntryValueSchema.parse({
          metric_id: metricId,
          value: value,
        }),
      );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const entryValues = deriveEntryValues();
      await updateEntry(entry.id, {
        recorded_at: recordedAt,
        comment,
        values: entryValues,
      });
      toast("Entry updated successfully", {
        icon: <CheckIcon />,
      });
      onComplete?.();
      onClose();
    } catch (error: unknown) {
      const message = extractErrorMessage(error);
      toast("Failed to update entry: " + message, {
        style: { background: "red", color: "white" },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const entryValues = deriveEntryValues();
  const isFormValid = entryValues.length > 0 && !!recordedAt;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-2xl">
        <Card className="w-full max-w-2xl mx-auto bg-black">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Edit Entry</CardTitle>
              <Button onClick={onClose} variant="ghost" size="icon">
                <XIcon />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date/Time Input */}
            <div className="space-y-2">
              <Label htmlFor="recorded-at">Date & Time</Label>
              <Input
                id="recorded-at"
                type="datetime-local"
                value={recordedAt}
                onChange={(e) => setRecordedAt(e.target.value)}
              />
            </div>

            <div className="border border-primary/70" />

            {/* Metric Values */}
            <div className="space-y-4">
              {metrics.map((metric) => (
                <div key={metric.id} className="flex flex-col gap-2">
                  <label className="font-semibold">{metric.name}</label>
                  <div className="flex w-full gap-2">
                    <ValueSelect
                      metric={metric}
                      baseline={submittedValues[metric.id]}
                      handleChange={handleSubmittedValue}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        removeMetric(metric.id);
                      }}
                    >
                      <XIcon className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Metric Picker */}
            <AdditionalMetricPicker
              addAdditionalMetric={(metric: Metric) => {
                setMetrics((prev) => {
                  if (prev.find((m) => m.id === metric.id)) {
                    return prev;
                  }
                  return [...prev, metric];
                });
              }}
              excludedMetricIds={metrics.map((m) => m.id)}
            />

            {/* Comment Input */}
            <div className="space-y-2">
              <Label htmlFor="entry-comment">Comments</Label>
              <Input
                id="entry-comment"
                type="text"
                placeholder="Do you have any notes or thoughts?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ minHeight: 48 }}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid || isSubmitting}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-5 h-5" />
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button onClick={onClose} variant="outline">
                <XIcon className="w-5 h-5" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
