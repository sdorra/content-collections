import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have content for each post", async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Hello World' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Follow Up' })).toBeVisible();
});

test("should render callout component", async ({ page }) => {
  await expect(page.getByRole('heading', { name: 'Callout' })).toBeVisible();
});