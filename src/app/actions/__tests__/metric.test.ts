import { createMetric } from "../metric";
import { createClient } from "@/lib/supabase/server";
import { MetricType } from "@/types/metric";
import { getUserId } from "@/lib/service/user";

jest.mock("@/lib/supabase/server");
jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));
jest.mock("@/lib/service/user");

describe("createMetric", () => {
  const mockInsert = jest.fn();
  const mockSelect = jest.fn();
  const mockSingle = jest.fn();
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: mockInsert,
    })),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockInsert.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockSingle.mockResolvedValue({ data: {}, error: null });

    jest.mocked(createClient).mockResolvedValue(mockSupabase);
    jest.mocked(getUserId).mockResolvedValue("user-123");
  });

  it("should replace null min_value and max_value with calculated values from labels", async () => {
    const metricData = {
      name: "Test Metric",
      description: "Test Description",
      metric_type: "scale" as MetricType,
      labels: { low: 1, medium: 5, high: 10 },
      min_value: null,
      max_value: null,
    };

    await createMetric(metricData);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        min_value: 1,
        max_value: 10,
      }),
    );
  });

  it("should preserve non-null min_value and max_value", async () => {
    const metricData = {
      name: "Test Metric",
      description: "Test Description",
      metric_type: "event" as MetricType,
      labels: {},
      min_value: 0,
      max_value: 1,
    };

    await createMetric(metricData);

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        min_value: 0,
        max_value: 1,
      }),
    );
  });

  it("should throw exception on mismatching labels and boundary", async () => {
    const metricData = {
      name: "Test Metric",
      description: "Test Description",
      metric_type: "event" as MetricType,
      min_value: 0,
      max_value: 1,
      labels: { only: 42 },
    };

    await expect(createMetric(metricData)).rejects.toThrow();
  });

  // it("should throw exception if information cannot be derived");
});
