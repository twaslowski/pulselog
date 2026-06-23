import { expect, test } from "@playwright/test";


test.describe(`Record creation`, () => {
  // Use the language-specific authentication
  test.use({
    storageState: `e2e/.auth/user.json`,
  });

  test("should allow user to create new record", async ({ page }) => {
    await page.goto("/protected/new-entry");

    await page.getByLabel("sleep").selectOption("8");
  });
});
