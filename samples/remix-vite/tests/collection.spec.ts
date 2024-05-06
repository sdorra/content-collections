import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have content for character", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "Arthur Dent" })
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Ford Prefect" })
  ).toBeVisible();
});
