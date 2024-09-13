import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have a link for each character", async ({ page }) => {
  await expect(page.getByRole("link", { name: "Arthur Dent" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ford Prefect" })).toBeVisible();
});

test("should navigate to character detail page", async ({ page }) => {
  await page.getByRole("link", { name: "Arthur Dent" }).click();
  await expect(page).toHaveURL("/characters/arthur");
  await expect(
    page.getByRole("heading", { name: "Arthur Dent" }),
  ).toBeVisible();
});
