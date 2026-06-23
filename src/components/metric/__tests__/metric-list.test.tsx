import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MetricList from "../metric-list";
import { MetricDialogProvider } from "../metric-dialog-provider";
import {
  mood,
  sleep,
  exercise,
  waterIntake,
  moodTracking,
  sleepTracking,
  exerciseTracking,
} from "@/__fixtures__";
import {
  trackMetric,
  untrackMetric,
  updateBaseline,
} from "@/app/actions/metric";
import { deriveHumanReadableMetricType } from "@/types/metric";

// Mock the server actions
jest.mock("@/app/actions/metric", () => ({
  trackMetric: jest.fn(),
  untrackMetric: jest.fn(),
  updateBaseline: jest.fn(),
}));

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: jest.fn(),
  }),
}));

jest.mock("@/hooks/use-is-mobile.ts", () => ({
  useIsMobile: jest.fn(() => ({ isMobile: false, isLoading: false })),
}));

// Helper function to render MetricList with required providers
const renderMetricList = (props: React.ComponentProps<typeof MetricList>) => {
  return render(
    <MetricDialogProvider>
      <MetricList {...props} />
    </MetricDialogProvider>,
  );
};

describe("MetricList", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Tabs Navigation", () => {
    it("renders all three tabs with correct labels", () => {
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [moodTracking, sleepTracking],
      });

      expect(
        screen.getByRole("tab", { name: /Tracked \(2\)/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /User \(2\)/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /System \(2\)/ }),
      ).toBeInTheDocument();
    });

    it("displays tracked tab by default", () => {
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [moodTracking, sleepTracking],
      });

      // Should show tracked metrics
      expect(screen.getByText("Mood")).toBeInTheDocument();
      expect(screen.getByText("Sleep Duration")).toBeInTheDocument();
    });

    it("switches to user tab when clicked", async () => {
      const user = userEvent.setup();
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [moodTracking],
      });

      const userTab = screen.getByRole("tab", { name: /User \(2\)/ });
      await user.click(userTab);

      // Wait for content to appear
      await waitFor(() => {
        expect(screen.getByText("Exercise Minutes")).toBeVisible();
      });
      expect(screen.getByText("Water Intake")).toBeVisible();
    });

    it("switches to system tab when clicked", async () => {
      const user = userEvent.setup();
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [exerciseTracking],
      });

      const systemTab = screen.getByRole("tab", { name: /System \(2\)/ });
      await user.click(systemTab);

      // Wait for content to appear
      await waitFor(() => {
        expect(screen.getByText("Mood")).toBeVisible();
      });
      expect(screen.getByText("Sleep Duration")).toBeVisible();
    });
  });

  describe("Tab Content", () => {
    it("shows empty state for tracked tab when no metrics are tracked", () => {
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [],
      });

      expect(
        screen.getByText(
          /No tracked metrics yet. Switch to User or System tabs to track metrics./,
        ),
      ).toBeInTheDocument();
    });

    it("shows empty state for user tab when no user metrics exist", async () => {
      const user = userEvent.setup();
      renderMetricList({ metrics: [mood, sleep], metricTracking: [] });

      const userTab = screen.getByRole("tab", { name: /User \(0\)/ });
      await user.click(userTab);

      await waitFor(() => {
        expect(screen.getByText(/No user-created metrics yet./)).toBeVisible();
      });
    });

    it("shows empty state for system tab when no system metrics exist", async () => {
      const user = userEvent.setup();
      renderMetricList({
        metrics: [exercise, waterIntake],
        metricTracking: [],
      });

      const systemTab = screen.getByRole("tab", { name: /System \(0\)/ });
      await user.click(systemTab);

      await waitFor(() => {
        expect(screen.getByText(/No system metrics available./)).toBeVisible();
      });
    });

    it("correctly counts metrics in each tab", () => {
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [moodTracking, exerciseTracking],
      });

      expect(
        screen.getByRole("tab", { name: /Tracked \(2\)/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /User \(2\)/ }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("tab", { name: /System \(2\)/ }),
      ).toBeInTheDocument();
    });
  });

  describe("Metric Cards", () => {
    it("displays metric name, description, and type badge", () => {
      renderMetricList({
        metrics: [mood, sleep],
        metricTracking: [moodTracking],
      });

      expect(screen.getByText("Mood")).toBeInTheDocument();
      expect(screen.getByText("Daily mood rating")).toBeInTheDocument();
      expect(
        screen.getByText(deriveHumanReadableMetricType("discrete")),
      ).toBeInTheDocument();
    });

    it("shows track checkbox for each metric", async () => {
      const user = userEvent.setup();
      renderMetricList({ metrics: [mood, sleep], metricTracking: [] });

      const systemTab = screen.getByRole("tab", { name: /System/ });
      await user.click(systemTab);

      await waitFor(() => {
        const checkboxes = screen.getAllByRole("checkbox");
        expect(checkboxes.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("checks the checkbox for tracked metrics", () => {
      renderMetricList({
        metrics: [mood, sleep],
        metricTracking: [moodTracking],
      });

      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes[0]).toBeChecked();
    });

    it("shows baseline input only for tracked metrics", async () => {
      const user = userEvent.setup();
      renderMetricList({
        metrics: [mood, sleep],
        metricTracking: [moodTracking],
      });

      // Baseline should be visible for tracked metric
      expect(screen.getByText("Your normal:")).toBeInTheDocument();

      // Switch to system tab where both metrics are shown
      const systemTab = screen.getByRole("tab", { name: /System/ });
      await user.click(systemTab);

      await waitFor(() => {
        expect(screen.getByText("Sleep Duration")).toBeVisible();
      });

      // There should still be only one baseline (for mood which is tracked)
      const baselineLabels = screen.getAllByText("Your normal:");
      expect(baselineLabels).toHaveLength(1);
    });
  });

  describe("Tracking Actions", () => {
    it("calls trackMetric when checking an untracked metric", async () => {
      const user = userEvent.setup();
      (trackMetric as jest.Mock).mockResolvedValue(undefined);

      renderMetricList({ metrics: [mood, sleep], metricTracking: [] });

      const systemTab = screen.getByRole("tab", { name: /System/ });
      await user.click(systemTab);

      await waitFor(async () => {
        const checkbox = screen.getAllByRole("checkbox")[0];
        await user.click(checkbox);
      });

      await waitFor(() => {
        expect(trackMetric).toHaveBeenCalledWith(expect.any(String), 0);
      });
    });

    it("calls untrackMetric when unchecking a tracked metric", async () => {
      const user = userEvent.setup();
      (untrackMetric as jest.Mock).mockResolvedValue(undefined);

      renderMetricList({
        metrics: [mood, sleep],
        metricTracking: [moodTracking],
      });

      const checkbox = screen.getAllByRole("checkbox")[0];
      await user.click(checkbox);

      await waitFor(() => {
        expect(untrackMetric).toHaveBeenCalledWith(mood.id);
      });
    });

    it("optimistically updates UI when tracking a metric", async () => {
      const user = userEvent.setup();
      (trackMetric as jest.Mock).mockResolvedValue(undefined);

      renderMetricList({ metrics: [mood, sleep], metricTracking: [] });

      const systemTab = screen.getByRole("tab", { name: /System/ });
      await user.click(systemTab);

      await waitFor(async () => {
        const checkbox = screen.getAllByRole("checkbox")[0];
        await user.click(checkbox);
        // Should immediately show as checked
        expect(checkbox).toBeChecked();
      });
    });
  });

  describe("Baseline Updates", () => {
    it("renders baseline selector for tracked metrics", async () => {
      (updateBaseline as jest.Mock).mockResolvedValue(undefined);

      renderMetricList({ metrics: [mood], metricTracking: [moodTracking] });

      // Baseline should be visible for tracked metric
      const baselineLabel = screen.getByText("Your normal:");
      expect(baselineLabel).toBeInTheDocument();

      // ValueSelect component should be rendered
      const selector = screen.getByLabelText("select-Mood");
      expect(selector).toBeInTheDocument();
    });
  });

  describe("Metric Categorization", () => {
    it("correctly categorizes system and user metrics", async () => {
      const user = userEvent.setup();
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [],
      });

      // Check user tab
      const userTab = screen.getByRole("tab", { name: /User \(2\)/ });
      await user.click(userTab);

      await waitFor(() => {
        expect(screen.getByText("Exercise Minutes")).toBeVisible();
      });
      expect(screen.getByText("Water Intake")).toBeVisible();

      // Check system tab
      const systemTab = screen.getByRole("tab", { name: /System \(2\)/ });
      await user.click(systemTab);

      await waitFor(() => {
        expect(screen.getByText("Mood")).toBeVisible();
      });
      expect(screen.getByText("Sleep Duration")).toBeVisible();
    });

    it("shows tracked metrics in tracked tab regardless of owner", () => {
      renderMetricList({
        metrics: [mood, sleep, exercise, waterIntake],
        metricTracking: [moodTracking, exerciseTracking],
      });

      // Tracked tab should show both system and user metrics that are tracked
      expect(screen.getByText("Mood")).toBeInTheDocument(); // system
      expect(screen.getByText("Exercise Minutes")).toBeInTheDocument(); // user
    });

    it("updates tracked count when metric is tracked/untracked", async () => {
      const user = userEvent.setup();
      (trackMetric as jest.Mock).mockResolvedValue(undefined);

      renderMetricList({ metrics: [mood, sleep], metricTracking: [] });

      // Initially 0 tracked
      expect(
        screen.getByRole("tab", { name: /Tracked \(0\)/ }),
      ).toBeInTheDocument();

      // Track a metric
      const systemTab = screen.getByRole("tab", { name: /System/ });
      await user.click(systemTab);

      await waitFor(async () => {
        const checkbox = screen.getAllByRole("checkbox")[0];
        await user.click(checkbox);
      });

      // Should update to 1 tracked (optimistically)
      await waitFor(() => {
        expect(
          screen.getByRole("tab", { name: /Tracked \(1\)/ }),
        ).toBeInTheDocument();
      });
    });
  });
});
