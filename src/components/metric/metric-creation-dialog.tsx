"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createMetric, updateMetric } from "@/app/actions/metric";
import { MetricType, Metric } from "@/types/metric";
import {
  HashIcon,
  LucideIcon,
  SmileIcon,
  XIcon,
  CheckSquareIcon,
} from "lucide-react";
import DiscreteMetricSpecification from "@/components/metric/specifications/discrete-metric-specification";
import ContinuousMetricSpecification from "@/components/metric/specifications/continuous-metric-specification";
import EventMetricSpecification from "@/components/metric/specifications/event-metric-specification";

interface MetricFormData {
  name: string;
  description: string;
  metricType: MetricType | null;
  labels: Record<string, number>;
  minValue: number | null;
  maxValue: number | null;
}

export interface MetricTypeDefinition {
  type: MetricType;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const METRIC_TYPE_DEFINITIONS: MetricTypeDefinition[] = [
  {
    type: "discrete",
    title: "Choose from labels",
    description:
      "Best for feelings or ratings. You’ll pick labels like “Great”, “Okay”, or “Not so good”.",
    icon: SmileIcon,
  },
  {
    type: "continuous",
    title: "Enter a number",
    description:
      "Best for anything you measure with a number, like hours of sleep or cups of coffee.",
    icon: HashIcon,
  },
  {
    type: "event",
    title: "Tap if it happened",
    description:
      "Best for simple yes/no moments like working out, drinking alcohol, or taking medication.",
    icon: CheckSquareIcon,
  },
  // {
  //   type: "streak",
  //   title: "Track a habit streak",
  //   description:
  //       "Best for building momentum — like days meditated or nights without screens.",
  //   icon: RepeatIcon
  // },
];

export default function MetricCreationDialog({
  onComplete,
  onClose,
  mode = "create",
  metric,
}: {
  onComplete?: () => void;
  onClose?: () => void;
  mode?: "create" | "edit";
  metric?: Metric;
}) {
  const [step, setStep] = useState(mode === "edit" && metric ? 4 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<MetricFormData>({
    name: metric?.name ?? "",
    description: metric?.description ?? "",
    metricType: metric?.metricType ?? null,
    labels: metric?.labels ?? {},
    minValue: metric?.minValue ?? null,
    maxValue: metric?.maxValue ?? null,
  });

  const totalSteps = 4;

  const handleNext = () => {
    setStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleMetricTypeSelection = (type: MetricType) => {
    setFormData({ ...formData, metricType: type });
    handleNext();
  };

  const canProceedStep1 = formData.name.trim().length > 0;
  const canProceedStep2 = formData.description.trim().length > 0;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>
              {mode === "edit" ? "Edit Metric" : "Create a New Metric"}
            </CardTitle>
            <CardDescription>
              Step {step} of {totalSteps}
            </CardDescription>
          </div>
          <Button onClick={onClose}>
            <XIcon />
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                What would you like to track?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Give your metric a short, descriptive name.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Metric Name</Label>
              <Input
                id="name"
                placeholder="e.g., Exercise, Stress Level, Water Intake"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button onClick={handleNext} disabled={!canProceedStep1}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Describe what you&apos;re tracking
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Add a brief description to help you remember what this metric is
                for.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Minutes of exercise per day"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="flex justify-between gap-2 mt-6">
              <Button
                onClick={handleBack}
                variant="outline"
                className="bg-gray-900"
              >
                Back
              </Button>
              <Button onClick={handleNext} disabled={!canProceedStep2}>
                Next
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                How do you want to record this metric?
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the type that best fits what you&apos;re tracking.
              </p>
            </div>
            <div className="space-y-3">
              {METRIC_TYPE_DEFINITIONS.map((metricTypeDef) => (
                <Card
                  aria-label={`choose-type-${metricTypeDef.type}`}
                  key={metricTypeDef.type}
                  className="cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleMetricTypeSelection(metricTypeDef.type)}
                >
                  <div className="flex">
                    <div className="flex items-center justify-center p-4">
                      <metricTypeDef.icon size={40} className="opacity-70" />
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {metricTypeDef.title}
                      </CardTitle>
                      <CardDescription>
                        {metricTypeDef.description}
                      </CardDescription>
                    </CardHeader>
                  </div>
                </Card>
              ))}
            </div>
            <div className="flex justify-between gap-2 mt-6">
              <Button onClick={handleBack} variant="outline">
                Back
              </Button>
            </div>
          </div>
        )}

        {step === 4 && formData.metricType === "discrete" && (
          <DiscreteMetricSpecification
            onBack={handleBack}
            initialLabels={mode === "edit" ? formData.labels : undefined}
            onSubmit={async (labels) => {
              setIsSubmitting(true);
              try {
                if (mode === "edit" && metric) {
                  await updateMetric(metric.id, {
                    name: formData.name,
                    description: formData.description,
                    metric_type: "discrete",
                    labels,
                    min_value: null,
                    max_value: null,
                  });
                } else {
                  await createMetric({
                    name: formData.name,
                    description: formData.description,
                    metric_type: "discrete",
                    labels,
                    min_value: null,
                    max_value: null,
                  });
                }
                onComplete?.();
              } catch (error) {
                console.error(`Failed to ${mode} metric:`, error);
                alert(`Failed to ${mode} metric. Please try again.`);
              } finally {
                setIsSubmitting(false);
              }
            }}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 4 && formData.metricType === "continuous" && (
          <ContinuousMetricSpecification
            onBack={handleBack}
            onSubmit={async (minValue, maxValue) => {
              setIsSubmitting(true);
              try {
                if (mode === "edit" && metric) {
                  await updateMetric(metric.id, {
                    name: formData.name,
                    description: formData.description,
                    metric_type: formData.metricType!,
                    labels: {},
                    min_value: minValue,
                    max_value: maxValue,
                  });
                } else {
                  await createMetric({
                    name: formData.name,
                    description: formData.description,
                    metric_type: formData.metricType!,
                    labels: {},
                    min_value: minValue,
                    max_value: maxValue,
                  });
                }
                onComplete?.();
              } catch (error) {
                console.error(`Failed to ${mode} metric:`, error);
                alert(`Failed to ${mode} metric. Please try again.`);
              } finally {
                setIsSubmitting(false);
              }
            }}
            isSubmitting={isSubmitting}
          />
        )}

        {step === 4 && formData.metricType === "event" && (
          <EventMetricSpecification
            onBack={handleBack}
            onSubmit={async () => {
              setIsSubmitting(true);
              try {
                if (mode === "edit" && metric) {
                  await updateMetric(metric.id, {
                    name: formData.name,
                    description: formData.description,
                    metric_type: "event",
                    labels: formData.labels,
                    min_value: 0,
                    max_value: 1,
                  });
                } else {
                  await createMetric({
                    name: formData.name,
                    description: formData.description,
                    metric_type: "event",
                    labels: {},
                    min_value: 0,
                    max_value: 1,
                  });
                }
              } catch (error) {
                console.error(`Failed to ${mode} metric:`, error);
                alert(`Failed to ${mode} metric. Please try again.`);
              } finally {
                setIsSubmitting(false);
              }
            }}
            isSubmitting={isSubmitting}
          />
        )}
      </CardContent>
    </Card>
  );
}
