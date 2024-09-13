import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have buttons for each posts", async ({ page }) => {
  await expect(page.getByRole("button", { name: "Hello World" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Follow Up" })).toBeVisible();
});

test("should have content for each posts", async ({ page }) => {
  await page.getByRole("button", { name: "Hello World" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello World" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Follow Up" }).click();
  await expect(page.getByRole("heading", { name: "Follow Up" })).toBeVisible();
});
