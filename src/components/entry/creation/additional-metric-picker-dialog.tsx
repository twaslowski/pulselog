"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { XIcon, Search } from "lucide-react";
import React, { useState, useMemo, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Metric, MetricSchema } from "@/types/metric";
import { z } from "zod";
import { MetricLabels } from "@/components/metric/metric-labels";

export default function AdditionalMetricPickerDialog({
  onComplete,
  onClose,
  excludedMetricIds = [],
}: {
  onComplete: (metric: Metric) => void;
  onClose: () => void;
  excludedMetricIds?: string[];
}) {
  const [allMetrics, setAllMetrics] = useState<Metric[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("metric")
        .select("*")
        .not("id", "in", `(${excludedMetricIds.join(",")})`)
        .order("name");

      if (error) {
        console.error("Error fetching metrics:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const metrics = z.array(MetricSchema).parse(data);
        setAllMetrics(metrics);
      }
      setLoading(false);
    };
    void loadMetrics();
  }, [excludedMetricIds]);

  const filteredMetrics = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return allMetrics;

    return allMetrics.filter(
      (metric) =>
        metric.name.toLowerCase().includes(query) ||
        metric.description.toLowerCase().includes(query),
    );
  }, [allMetrics, searchQuery]);

  const handleMetricSelect = (metric: Metric) => {
    onComplete(metric);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gray-900">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Track another metric</CardTitle>
            <CardDescription>
              Select a metric to add to your entry
            </CardDescription>
          </div>
          <Button onClick={onClose} variant="ghost" size="icon">
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search metrics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading metrics...
            </div>
          ) : filteredMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery
                ? "No metrics found matching your search"
                : "No metrics available"}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredMetrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => handleMetricSelect(metric)}
                  className="w-full text-left p-4 rounded-lg border transition-colors bg-card border-border hover:bg-accent hover:border-accent-foreground cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium">{metric.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {metric.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <MetricLabels metric={metric} />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
