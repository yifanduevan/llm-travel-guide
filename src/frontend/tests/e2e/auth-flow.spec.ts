import { expect, test } from "@playwright/test";

const TEST_EMAIL = "tester@example.com";
const TEST_PASSWORD = "password123";

test("redirects unauthenticated user from trips to login and allows sign in", async ({
  page,
}) => {
  await page.route("**/api/trips", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: "[]",
    });
  });

  await page.goto("/trips");
  await expect(page).toHaveURL(/\/login(\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByLabel("Email").fill(TEST_EMAIL);
  await page.getByLabel("Password").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("heading", { name: "Recent Trips" })).toBeVisible();
});
