import { expect, test } from "@playwright/test";


test.describe(`Entry creation`, () => {
  // Use the language-specific authentication
  test.use({
    storageState: `e2e/.auth/user.json`,
  });

  test("should allow user to create new record", async ({ page }) => {
    await page.goto("/protected/new-entry");

    // Click the button of the "mood" metric; requires mood to be tracked and Neutral to be the default
    // await page.getByRole("button", { name: "Neutral" }).click()

    await page.getByRole("button", { name: "save-entry" }).click()

    await expect(
      page.getByText("Success")
    ).toBeVisible();
  });
});
