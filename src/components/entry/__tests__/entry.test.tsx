import { render, screen, within } from "@testing-library/react";
import { Entry } from "../visualization/entry";
import { mood, sleep } from "@/__fixtures__/metric";
import { EntryValueWithMetric } from "@/types/entry-value";
import { entry } from "@/__fixtures__";

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(),
}));

describe("entry visualization", () => {
  it("should render single entry", () => {
    const entryWithoutValues = {
      ...entry,
      values: [],
    };
    render(
      <Entry
        entry={entryWithoutValues}
        onEdit={() => {}}
        onDelete={() => {}}
      />,
    );

    const noRecords = screen.getByText("No values recorded");
    expect(noRecords).toBeInTheDocument();
  });

  it("should render entries with labels", () => {
    const values: EntryValueWithMetric[] = [
      { metricId: mood.id, value: 0, metric: mood },
      { metricId: sleep.id, value: 7, metric: sleep },
    ];
    const entryWithValues = {
      ...entry,
      values,
    };

    render(
      <Entry entry={entryWithValues} onEdit={() => {}} onDelete={() => {}} />,
    );

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
