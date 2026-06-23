import { render, screen, within } from "@testing-library/react";
import { Entry } from "../visualization/entry";
import { mood, sleep } from "@/__fixtures__/metric";
import { EntryValueWithMetric } from "@/types/entry-value";

const entry = {
  id: 123,
  user_id: "user_1",
  recorded_at: "2024-06-01T12:00:00Z",
  creation_timestamp: "2024-06-01T12:00:00Z",
  updated_timestamp: "2024-06-01T12:00:00Z",
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("entry visualization", () => {
  it("should render single entry", () => {
    const entryWithoutValues = {
      ...entry,
      values: [],
    };
    render(<Entry entry={entryWithoutValues} />);

    const noRecords = screen.getByText("No values recorded");
    expect(noRecords).toBeInTheDocument();
  });

  it("should render entries with labels", () => {
    const values: EntryValueWithMetric[] = [
      { metric_id: mood.id, value: 0, metric: mood },
      { metric_id: sleep.id, value: 7, metric: sleep },
    ];
    const entryWithValues = {
      ...entry,
      values,
    };

    render(<Entry entry={entryWithValues} />);

    const moodBadge = screen.getByLabelText(
      `entry-${entry.id}-value-${mood.name}`,
    );
    expect(moodBadge).toBeInTheDocument();
    expect(within(moodBadge).getByText("Neutral")).toBeInTheDocument();

    const sleepBadge = screen.getByLabelText(
      `entry-${entry.id}-value-${sleep.name}`,
    );
    expect(sleepBadge).toBeInTheDocument();
    expect(within(sleepBadge).getByText("7")).toBeInTheDocument();
  });
});
