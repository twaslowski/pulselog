import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import MetricInput from "../metric-input";
import { mood, sleep } from "@/__fixtures__";

describe("MetricInput", () => {
  it("renders discrete metric options in descending order", () => {
    const handleSelect = jest.fn();
    render(
      <MetricInput metric={mood} baseline={0} onMetricSelect={handleSelect} />,
    );
    // Should render labels sorted by value descending: Happy, Neutral, Depressed
    const options = screen.getAllByRole("button");
    expect(options[0]).toHaveTextContent("Happy");
    expect(options[1]).toHaveTextContent("Neutral");
    expect(options[2]).toHaveTextContent("Depressed");
  });

  it("calls onMetricSelect with correct args for discrete metric", () => {
    const handleSelect = jest.fn();
    render(
      <MetricInput metric={mood} baseline={0} onMetricSelect={handleSelect} />,
    );
    const happyBtn = screen.getByLabelText("select-Mood-value-Happy");
    fireEvent.click(happyBtn);
    expect(handleSelect).toHaveBeenCalledWith(mood.id, 1);
  });

  it("renders continuous metric options for the correct range", () => {
    const handleSelect = jest.fn();
    render(
      <MetricInput metric={sleep} baseline={8} onMetricSelect={handleSelect} />,
    );
    // Should render 25 options (0 to 24)
    const options = screen.getAllByRole("button");
    expect(options.length).toBe(25);
    expect(options[0]).toHaveTextContent("0");
    expect(options[24]).toHaveTextContent("24");
  });

  it("calls onMetricSelect with correct args for continuous metric", () => {
    const handleSelect = jest.fn();
    render(
      <MetricInput metric={sleep} baseline={8} onMetricSelect={handleSelect} />,
    );
    const btn = screen.getByRole("button", { name: /^8$/ });
    fireEvent.click(btn);
    expect(handleSelect).toHaveBeenCalledWith(sleep.id, 8);
  });

  it("throws error if discrete metric has no labels", () => {
    const badMetric = { ...mood, labels: {} };
    const handleSelect = jest.fn();
    // Suppress error output
    jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() =>
      render(
        <MetricInput
          metric={badMetric}
          baseline={0}
          onMetricSelect={handleSelect}
        />,
      ),
    ).toThrow(/labels defined/);
    (console.error as jest.Mock).mockRestore();
  });
});
