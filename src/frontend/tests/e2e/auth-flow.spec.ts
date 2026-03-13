import { expect, test } from "@playwright/test";

test("redirects unauthenticated user from trips to login and allows sign in", async ({
  page,
}) => {
  await page.goto("/trips");
  await expect(page).toHaveURL(/\/login(\?.*)?$/);
  await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();

  await page.getByLabel("Email").fill("tester@example.com");
  await page.getByLabel("Password").fill("password123");
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/trips$/);
  await expect(page.getByRole("heading", { name: "Recent Trips" })).toBeVisible();
});
