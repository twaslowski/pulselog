import { test } from "@playwright/test";

test.describe(`Sign-up`, () => {
  // Use the language-specific authentication
  test.use({
    storageState: `e2e/.auth/user.json`,
  });

  test("should allow a user to sign up", async ({ page }) => {
    await page.goto("/protected/metrics");
  });
});
