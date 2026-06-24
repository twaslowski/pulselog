import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DiscreteMetricSpecification from "../discrete-metric-specification";

describe("DiscreteMetricSpecification", () => {
  const mockOnBack = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("rendering and basic interactions", () => {
    it("should render with initial empty label", () => {
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      expect(
        screen.getByPlaceholderText("e.g., Happy, Sad, Neutral"),
      ).toBeInTheDocument();
      expect(screen.getByText("+ Add Another Option")).toBeInTheDocument();
    });

    it("should add a new label entry when clicking add button", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);
      await user.click(addButton);

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      expect(inputs).toHaveLength(3);
    });

    it("should remove a label entry when clicking delete button", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);
      await user.click(addButton);

      let inputs = screen.getAllByPlaceholderText("e.g., Happy, Sad, Neutral");
      expect(inputs).toHaveLength(3);

      // Get all buttons and find the first trash button (there should be 2 delete buttons for 3 items)
      const deleteButtons = screen.getAllByLabelText("remove-label");

      if (deleteButtons.length === 0) {
        throw new Error("No delete buttons found");
      }
      await user.click(deleteButtons[0]);

      inputs = screen.getAllByPlaceholderText("e.g., Happy, Sad, Neutral");
      expect(inputs).toHaveLength(2);
    });

    it("should not allow removing all labels", async () => {
      userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const deleteButtons = screen.queryAllByRole("button", { name: "" });
      expect(deleteButtons.length).toBe(0);
    });

    it("should call onBack when back button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const backButton = screen.getByText("Back");
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe("duplicate label validation", () => {
    it("should reject duplicate labels (case-insensitive)", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      // Add first label
      await user.type(inputs[0], "Happy");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "happy");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      // Should show error message
      expect(
        screen.getByText("Duplicate labels found. Each label must be unique."),
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should reject exact duplicate labels", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Happy");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Happy");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      expect(
        screen.getByText("Duplicate labels found. Each label must be unique."),
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should reject duplicates with whitespace variations", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "  Happy  ");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Happy");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      expect(
        screen.getByText("Duplicate labels found. Each label must be unique."),
      ).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("should allow unique labels to proceed", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Happy");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Sad");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      expect(
        screen.queryByText(
          "Duplicate labels found. Each label must be unique.",
        ),
      ).not.toBeInTheDocument();
      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it("should clear error when user modifies labels after error", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Happy");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Happy");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      expect(
        screen.getByText("Duplicate labels found. Each label must be unique."),
      ).toBeInTheDocument();

      // Now modify one of the labels
      const allInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.tripleClick(allInputs[1]);
      await user.type(allInputs[1], "Sad");

      // Error should be cleared
      await waitFor(() => {
        expect(
          screen.queryByText(
            "Duplicate labels found. Each label must be unique.",
          ),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("auto-generated values", () => {
    it("should generate correct values in descending order (best to worst)", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Happy");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Neutral");
      await user.type(newInputs[2], "Sad");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        Happy: 3,
        Neutral: 2,
        Sad: 1,
      });
    });

    // it("should generate values from 1 to n where n is the number of labels", async () => {
    //   const user = userEvent.setup();
    //   render(
    //     <DiscreteMetricSpecification
    //       onBack={mockOnBack}
    //       onSubmit={mockOnSubmit}
    //       isSubmitting={false}
    //     />,
    //   );
    //
    //   const inputs = screen.getAllByPlaceholderText(
    //     "e.g., Happy, Sad, Neutral",
    //   );
    //
    //   await user.type(inputs[0], "Very Good");
    //
    //   const addButton = screen.getByText("+ Add Another Option");
    //   await user.click(addButton);
    //   await user.click(addButton);
    //   await user.click(addButton);
    //   await user.click(addButton);
    //
    //   const newInputs = screen.getAllByPlaceholderText(
    //     "e.g., Happy, Sad, Neutral",
    //   );
    //   await user.type(newInputs[1], "Good");
    //   await user.type(newInputs[2], "Okay");
    //   await user.type(newInputs[3], "Bad");
    //   await user.type(newInputs[4], "Very Bad");
    //
    //   const submitButton = screen.getByText("Create Metric");
    //   await user.click(submitButton);
    //
    //   const call = mockOnSubmit.mock.calls[0][0];
    //
    //   // Verify values are sequential from 1 to 5
    //   // todo: compile error, but I believe this can be fixed when migrating away from server actions
    //   expect(Object.values(call).sort((a, b) => a - b)).toEqual([
    //     1, 2, 3, 4, 5,
    //   ]);
    //
    //   // Verify first label has the highest value
    //   expect(call["Very Good"]).toBe(5);
    //
    //   // Verify last label has the lowest value
    //   expect(call["Very Bad"]).toBe(1);
    // });

    it("should skip empty labels when assigning values", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Good");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      // Leave middle one empty
      await user.type(newInputs[2], "Bad");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith({
        Good: 2,
        Bad: 1,
      });
    });
  });

  describe("result object structure", () => {
    it("should return object with string keys and number values", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Happy");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Sad");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      const result = mockOnSubmit.mock.calls[0][0];

      expect(typeof result).toBe("object");
      expect(result).not.toBeNull();

      // Verify all keys are strings
      Object.keys(result).forEach((key) => {
        expect(typeof key).toBe("string");
      });

      // Verify all values are numbers
      Object.values(result).forEach((value) => {
        expect(typeof value).toBe("number");
      });
    });

    it("should return object with exactly the entered labels as keys", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Excellent");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Average");
      await user.type(newInputs[2], "Poor");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      const result = mockOnSubmit.mock.calls[0][0];

      expect(Object.keys(result).sort()).toEqual([
        "Average",
        "Excellent",
        "Poor",
      ]);
    });

    it("should preserve label casing in result object", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "VeRy GoOd");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "bAd");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      const result = mockOnSubmit.mock.calls[0][0];

      expect(Object.keys(result)).toContain("VeRy GoOd");
      expect(Object.keys(result)).toContain("bAd");
    });

    it("should have length equal to number of non-empty labels", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      await user.type(inputs[0], "Good");

      const addButton = screen.getByText("+ Add Another Option");
      await user.click(addButton);
      await user.click(addButton);
      await user.click(addButton);

      const newInputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(newInputs[1], "Medium");
      // Leave index 2 empty
      await user.type(newInputs[3], "Bad");

      const submitButton = screen.getByText("Create Metric");
      await user.click(submitButton);

      const result = mockOnSubmit.mock.calls[0][0];

      expect(Object.keys(result)).toHaveLength(3);
    });
  });

  describe("initial labels loading", () => {
    it("should load initial labels in correct order (best to worst)", () => {
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
          initialLabels={{ Good: 3, Bad: 1, Okay: 2 }}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );

      // Should be ordered by value descending: Good (3), Okay (2), Bad (1)
      expect((inputs[0] as HTMLInputElement).value).toBe("Good");
      expect((inputs[1] as HTMLInputElement).value).toBe("Okay");
      expect((inputs[2] as HTMLInputElement).value).toBe("Bad");
    });
  });

  describe("disabled state", () => {
    it("should disable create button when no labels are filled", () => {
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const submitButton = screen.getByText(
        "Create Metric",
      ) as HTMLButtonElement;
      expect(submitButton).toBeDisabled();
    });

    it("should enable create button when at least one label is filled", async () => {
      const user = userEvent.setup();
      render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(inputs[0], "Happy");

      const submitButton = screen.getByText(
        "Create Metric",
      ) as HTMLButtonElement;
      expect(submitButton).toBeEnabled();
    });

    it("should disable create button when isSubmitting is true", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={false}
        />,
      );

      const inputs = screen.getAllByPlaceholderText(
        "e.g., Happy, Sad, Neutral",
      );
      await user.type(inputs[0], "Happy");

      let submitButton = screen.getByText("Create Metric") as HTMLButtonElement;
      expect(submitButton).toBeEnabled();

      rerender(
        <DiscreteMetricSpecification
          onBack={mockOnBack}
          onSubmit={mockOnSubmit}
          isSubmitting={true}
        />,
      );

      submitButton = screen.getByText("Creating...") as HTMLButtonElement;
      expect(submitButton).toBeDisabled();
    });
  });
});
