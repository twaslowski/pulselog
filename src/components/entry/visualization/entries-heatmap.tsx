"use client";

import {
  eachDayOfInterval,
  endOfYear,
  format,
  isSameDay,
  startOfYear,
} from "date-fns";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Entry } from "@/types/entry";
import { Metric } from "@/types/metric";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  extractAvailableMetrics,
  extractAvailableYears,
  getMoodColor,
  groupValuesByDate,
} from "@/lib/visualization-utils";

interface HeatmapProps {
  entries: Entry[];
}

// todo: DayData should be supplied with a comment from Entry
interface DayData {
  date: Date;
  comment?: string;
  values: number[];
  bounds: {
    minValue: number;
    maxValue: number;
  } | null;
}

export default function EntriesHeatmap({ entries }: HeatmapProps) {
  // Extract available years from entries
  const availableYears = useMemo(
    () => extractAvailableYears(entries),
    [entries],
  );

  const availableMetrics: Map<string, Metric> = useMemo(
    () => extractAvailableMetrics(entries),
    [entries],
  );

  const moodMetric = useMemo(() => {
    return availableMetrics.get("mood");
  }, [availableMetrics]);

  const [selectedMetric] = useState<Metric>(
    moodMetric ?? availableMetrics.values().toArray()[0],
  );

  const [selectedYear, setSelectedYear] = useState<string>(
    availableYears[availableYears.length - 1] ||
      new Date().getFullYear().toString(),
  );

  // Update selected year when available years change
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  }, [availableYears, selectedYear]);

  const values = useMemo(
    () => groupValuesByDate(entries, selectedMetric.id),
    [entries, selectedMetric],
  );

  // Prepare heatmap data for the selected year
  const heatmapData = useMemo(() => {
    const year = parseInt(selectedYear);
    const yearStart = startOfYear(new Date(year, 0, 1));
    const yearEnd = endOfYear(new Date(year, 0, 1));
    const allDays = eachDayOfInterval({ start: yearStart, end: yearEnd });

    const monthsData: DayData[][] = [];
    for (let month = 0; month < 12; month++) {
      const monthDays: DayData[] = [];
      allDays.forEach((day) => {
        if (day.getMonth() === month) {
          const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`;
          const dayValues = values.get(dayKey) ?? [];
          monthDays.push({
            date: day,
            values: dayValues.map((v) => v.value),
            bounds: {
              minValue: selectedMetric.min_value,
              maxValue: selectedMetric.max_value,
            },
          });
        }
      });
      monthsData.push(monthDays);
    }

    return monthsData;
  }, [values, selectedMetric, selectedYear]);

  // Year navigation
  const currentYearIndex = useMemo(
    () => availableYears.indexOf(selectedYear),
    [availableYears, selectedYear],
  );

  const previousYear = useCallback(() => {
    if (currentYearIndex > 0) {
      setSelectedYear(availableYears[currentYearIndex - 1]);
    }
  }, [availableYears, currentYearIndex]);

  const nextYear = useCallback(() => {
    if (currentYearIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentYearIndex + 1]);
    }
  }, [availableYears, currentYearIndex]);

  const isPreviousYearAvailable = currentYearIndex > 0;
  const isNextYearAvailable = currentYearIndex < availableYears.length - 1;

  const today = new Date();

  return (
    <div className="w-full mb-8">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={previousYear}
            disabled={!isPreviousYearAvailable}
            className={`p-2 rounded-full border ${
              isPreviousYearAvailable
                ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                : "border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Previous year"
          >
            <ChevronLeft />
          </Button>
          <h3 className="text-lg font-semibold min-w-[120px] text-center">
            {selectedYear}
          </h3>
          <Button
            variant="ghost"
            onClick={nextYear}
            disabled={!isNextYearAvailable}
            className={`p-2 rounded-full border ${
              isNextYearAvailable
                ? "border-gray-300 hover:bg-gray-100 text-gray-700"
                : "border-gray-200 text-gray-300 cursor-not-allowed"
            }`}
            aria-label="Next year"
          >
            <ChevronRight />
          </Button>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mb-4 text-sm">
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgb(100, 100, 255)" }}
            />
            <span>Depressed</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded bg-green-200 border border-gray-300`}
            />
            <span>Neutral</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgb(255, 100, 100)" }}
            />
            <span>Manic</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded"
              style={{ backgroundColor: "rgb(255, 255, 255)" }}
            />
            <span>No Data</span>
          </div>
        </div>

        {/* Heatmap Grid */}
        <div className="flex gap-1 justify-center">
          {heatmapData.map((monthDays, monthIndex) => (
            <div key={monthIndex} className="flex gap-1">
              {/* Day of month column - only for first month */}
              {monthIndex === 0 && (
                <div className="flex flex-col gap-0.5 items-end mr-1">
                  {/* Empty space for month label alignment */}
                  <div className="h-6 mb-1" />
                  {/* Render day numbers */}
                  {monthDays.map((dayData, dayIndex) => (
                    <div
                      key={dayIndex}
                      className="text-xs text-primary w-5 h-5 flex items-center justify-end pr-1"
                    >
                      {dayData.date.getDate()}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-col gap-1">
                {/* Month label */}
                <div className="text-xs text-center font-medium mb-1 h-6">
                  {format(monthDays[0].date, "MMM")}
                </div>

                {/* Days in month */}
                <div className="flex flex-col gap-0.5">
                  {monthDays.map((dayData, dayIndex) => {
                    const isToday = isSameDay(dayData.date, today);
                    const isFutureDay = dayData.date > today;
                    const hasValues = dayData.values.length > 0;
                    const hasMultipleValues = dayData.values.length > 1;

                    const style: React.CSSProperties = {};
                    let borderColor = "#e5e7eb";

                    if (isFutureDay) {
                      style.backgroundColor = "#f9fafb";
                      borderColor = "#e5e7eb";
                    } else if (hasValues && dayData.bounds) {
                      borderColor = "#d1d5db";

                      if (hasMultipleValues) {
                        // Create gradient for multiple values
                        const colors = dayData.values.map((value) =>
                          getMoodColor(
                            value,
                            dayData.bounds!.minValue,
                            dayData.bounds!.maxValue,
                          ),
                        );
                        const percentage = 100 / colors.length;
                        const gradientStops = colors
                          .map((color, i) => {
                            const start = i * percentage;
                            const end = (i + 1) * percentage;
                            return `${color} ${start}%, ${color} ${end}%`;
                          })
                          .join(", ");
                        style.background = `linear-gradient(90deg, ${gradientStops})`;
                      } else {
                        // Single value - solid color
                        style.backgroundColor = getMoodColor(
                          dayData.values[0],
                          dayData.bounds.minValue,
                          dayData.bounds.maxValue,
                        );
                      }
                    } else {
                      style.backgroundColor = "white";
                    }

                    style.border = `1px solid ${borderColor}`;

                    const tooltipText = hasValues
                      ? `${format(dayData.date, "MMM dd, yyyy")}: ${dayData.values.map((v) => v.toFixed(1)).join(", ")}`
                      : format(dayData.date, "MMM dd, yyyy");

                    return (
                      <div
                        key={dayIndex}
                        className={`w-5 h-5 rounded-sm ${isToday ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
                        style={style}
                        title={tooltipText}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
