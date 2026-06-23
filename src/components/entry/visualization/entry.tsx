import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { type Entry } from "@/types/entry";
import { type EntryValueWithMetric } from "@/types/entry-value";
import { type Metric } from "@/types/metric";
import { Button } from "@/components/ui/button";
import { TrashIcon, EditIcon } from "lucide-react";
import { EntryComment } from "@/components/entry/comment";

interface EntryProps {
  entry: Entry;
  onEdit: () => void;
  onDelete: () => void;
}

export function Entry({ entry, onEdit, onDelete }: EntryProps) {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Given the numeric value, possibly derive the corresponding label for discrete metrics
  const deriveMetricValue = (value: number, metric: Metric): string => {
    if (metric.metric_type === "continuous") {
      return value.toString();
    }

    return (
      Object.keys(metric.labels).find((key) => metric.labels[key] === value) ??
      value.toString()
    );
  };

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-row justify-between gap-x-4 items-center">
          <CardTitle>{formatDateTime(entry.recorded_at)}</CardTitle>
          <div className="flex flex-row">
            <Button
              variant="ghost"
              className="h-8 rounded-md text-xs"
              onClick={onEdit}
            >
              <EditIcon />
            </Button>
            <Button
              variant="ghost"
              className="h-8 rounded-md text-xs"
              onClick={onDelete}
            >
              <TrashIcon color="red" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {entry.values.map((value: EntryValueWithMetric, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  aria-label={`entry-${entry.id}-value-${value.metric.name}`}
                  className="px-3 py-1"
                >
                  <span className="font-medium">{value.metric.name}:</span>
                  <span className="ml-1">
                    {deriveMetricValue(value.value, value.metric)}
                  </span>
                </Badge>
              ))}
              {entry.comment && <EntryComment comment={entry.comment} />}
            </div>
            {entry.values.length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No values recorded
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
