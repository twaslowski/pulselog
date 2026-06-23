import { expect, test as setup } from "@playwright/test";
import { randomUUID } from "crypto";

const testPassword = "TestPassword123!";

setup(`authenticate`, async ({ page }) => {
  // Generate a unique email for this test run
  const uuid = randomUUID();
  const testEmail = generateTestEmail(uuid);

  const authFile = `e2e/.auth/user.json`;

  // Navigate to signup page
  await page.goto("/auth/sign-up");

  // Fill in signup form
  await page.getByLabel("Email").fill(testEmail);
  await page.getByLabel("Password", { exact: true }).fill(testPassword);
  await page.getByLabel("Repeat Password").fill(testPassword);

  /* eslint-disable-next-line testing-library/prefer-screen-queries */
  await page.getByRole("button", { name: "sign-up" }).click();

  // Wait for navigation to language selection page
  await page.waitForURL("/protected");

  // Verify we're on the dashboard
  await expect(
    /* eslint-disable-next-line testing-library/prefer-screen-queries */
    page.getByRole("heading", { name: /Welcome back/i }),
  ).toBeVisible();

  // Save authentication state for this language
  await page.context().storageState({ path: authFile });
});

function generateTestEmail(uuid: string) {
  return `user+${uuid}@pulselog.me`;
}
