import { expect, test } from "@playwright/test";
import { randomUUID } from "crypto";

test.describe(`Sign-up`, () => {
  // Use the language-specific authentication
  test.use({
    storageState: `e2e/.auth/user.json`,
  });

  test("should allow user to add a metric", async ({ page }) => {
    await page.goto("/protected/metrics");

    const metricName = randomUUID();

    await page.getByRole("button", { name: "create-metric" }).click();

    await page.getByLabel("name").fill(metricName);
    await page.getByRole("button", { name: "next" }).click()

    await page.getByLabel("description").fill("anxiety levels today");
    await page.getByRole("button", { name: "next" }).click();

    await page.getByLabel("continuous").click()

    await page.getByLabel("minValue").fill("0")
    await page.getByLabel("maxValue").fill("10")

    await page.getByLabel("create-metric").click()

    await page.getByRole("tab", {name: "user"}).click();

    await expect(
          page.getByText(new RegExp(metricName, "i")),
    ).toBeVisible();
  });
});
