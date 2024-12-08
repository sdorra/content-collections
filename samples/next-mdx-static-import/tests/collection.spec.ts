import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should list available posts", async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      name: "How a Sloth Revolutionized Our Deadline Management",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "My GPS Was Possessed By A Mischievous Mountain Goat",
    }),
  ).toBeVisible();
});

test("should render post content", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "How a Sloth Revolutionized Our Deadline Management",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "The Great Validation Revelation" }),
  ).toBeVisible();
});

test("should render imported component", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "How a Sloth Revolutionized Our Deadline Management",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "Internship at ContentCrafter Inc." }),
  ).toBeVisible();
});
