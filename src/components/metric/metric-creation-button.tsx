"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useMetricDialog } from "@/components/metric/metric-dialog-provider";

export default function MetricCreationButton() {
  const { openCreateDialog } = useMetricDialog();

  return <Button onClick={openCreateDialog}>+ Create Metric</Button>;
}
