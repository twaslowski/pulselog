"use client";

import React, { useState, useEffect } from "react";
import { type MetricTracking } from "@/types/tracking";
import { type EntryValue, EntryValueSchema } from "@/types/entry-value";
import { DatePicker } from "@/components/entry/creation/datetime-input";
import ValueSelect from "@/components/entry/value-select";
import { AdditionalMetricPicker } from "@/components/entry/creation/additional-metric-picker";
import { Metric } from "@/types/metric";
import { Button } from "@/components/ui/button";
import { XIcon, Save, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createEntry } from "@/lib/entry";
import toast, { CheckmarkIcon } from "react-hot-toast";

interface CreateEntryFormProps {
  trackedMetrics: MetricTracking[];
}

export default function EntryCreationForm({
  trackedMetrics,
}: CreateEntryFormProps) {
  const router = useRouter();
  const [recordedAt, setRecordedAt] = useState<Date>(new Date());
  const [submittedValues, setSubmittedValues] = useState<
    Record<string, number>
  >({});
  const [metrics, setMetrics] = useState<Metric[]>(
    trackedMetrics.map((tm) => tm.metric),
  );
  const [comment, setComment] = useState("");

  // Helper function to get baseline for a metric if it's tracked
  const getBaseline = (metricId: string): number => {
    const tracked = trackedMetrics.find((tm) => tm.metric.id === metricId);
    return tracked ? tracked.baseline : 0;
  };

  // Preselect baseline values by default for tracked metrics
  useEffect(() => {
    setSubmittedValues((prev) => {
      const updated = { ...prev };
      trackedMetrics.forEach((tm) => {
        if (updated[tm.metric.id] === undefined) {
          updated[tm.metric.id] = tm.baseline;
        }
      });
      return updated;
    });
  }, [trackedMetrics]);

  const handleSubmittedValue = (metricId: string, value: number) => {
    setSubmittedValues((prev) => ({
      ...prev,
      [metricId]: value,
    }));
  };

  const deriveEntryValues = (): EntryValue[] => {
    return Object.entries(submittedValues)
      .filter(([value]) => value !== undefined)
      .map(([metricId, value]) =>
        EntryValueSchema.parse({
          metricId: metricId,
          value: value,
        }),
      );
  };

  const removeMetric = (metricId: string) => {
    setMetrics((prev) => prev.filter((m) => m.id !== metricId));
    setSubmittedValues((prev) => {
      const updated = { ...prev };
      delete updated[metricId];
      return updated;
    });
  };

  const entryValues = deriveEntryValues();
  const isFormValid = entryValues.length > 0 && !!recordedAt;

  const handleSubmit = async () => {
    try {
      await createEntry({
        comment,
        values: entryValues,
        recordedAt: recordedAt,
      });
      router.push("/protected");
      toast("Success!", {
        icon: <CheckmarkIcon />,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to create entry. Please try again.");
    }
  };

  const handleCancel = () => {
    router.push("/protected");
  };

  return (
    <div className="bg-primary-foreground/90 rounded-2xl shadow-xl p-8 max-h-75vh overflow-y-auto">
      <DatePicker onChange={setRecordedAt} />

      <div className="border border-primary/70 my-8" />

      <div className="space-y-4 mb-4">
        {metrics.map((metric) => (
          <div key={metric.id} className="flex flex-col gap-2">
            <label className="font-semibold">{metric.name}</label>
            <div className="flex w-full gap-2">
              <ValueSelect
                metric={metric}
                baseline={submittedValues[metric.id] ?? getBaseline(metric.id)}
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

      <div>
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

      <div className="flex gap-4 pt-4">
        <Button
          aria-label="save-entry"
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-primary disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Save className="w-5 h-5" />
          Save Entry
        </Button>
        <Button onClick={handleCancel}>
          <X className="w-5 h-5" aria-label="cancel" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
