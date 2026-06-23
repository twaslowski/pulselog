"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import MetricCreationDialog from "@/components/metric/metric-creation-dialog";
import { Metric } from "@/types/metric";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CheckIcon } from "lucide-react";

interface MetricDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (metric: Metric) => void;
  closeDialog: () => void;
}

const MetricDialogContext = createContext<MetricDialogContextType | undefined>(
  undefined,
);

export function MetricDialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedMetric, setSelectedMetric] = useState<Metric | undefined>();
  const router = useRouter();

  const openCreateDialog = () => {
    setMode("create");
    setSelectedMetric(undefined);
    setIsOpen(true);
  };

  const openEditDialog = (metric: Metric) => {
    setMode("edit");
    setSelectedMetric(metric);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setSelectedMetric(undefined);
  };

  const handleComplete = () => {
    closeDialog();
    toast("Success!", {
      icon: <CheckIcon />,
    });
    router.refresh();
  };

  return (
    <MetricDialogContext.Provider
      value={{ openCreateDialog, openEditDialog, closeDialog }}
    >
      {children}
      {isOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-2xl">
            <MetricCreationDialog
              onComplete={handleComplete}
              onClose={closeDialog}
              mode={mode}
              metric={selectedMetric}
            />
          </div>
        </div>
      )}
    </MetricDialogContext.Provider>
  );
}

export function useMetricDialog(): MetricDialogContextType {
  const context = useContext(MetricDialogContext);
  if (context === undefined) {
    throw new Error(
      "useMetricDialog must be used within a MetricDialogProvider",
    );
  }
  return context;
}
