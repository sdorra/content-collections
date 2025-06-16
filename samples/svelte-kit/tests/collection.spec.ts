import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should list available posts", async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      name: "How a Flamingo Became Our Brand Identity Consultant",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "My Laptop Got Kidnapped By An Entrepreneurial Octopus",
    }),
  ).toBeVisible();
    await expect(
    page.getByRole("heading", {
      name: "When a Squirrel Became Our Chief Idea Officer",
    }),
  ).toBeVisible();
});

test("should render post content", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "How a Flamingo Became Our Brand Identity Consultant",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "Paradise Found, Chaos Ensued" }),
  ).toBeVisible();
});

test("should render imported component", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "When a Squirrel Became Our Chief Idea Officer",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "🐿️ Squirrel Counter" }),
  ).toBeVisible();
});
