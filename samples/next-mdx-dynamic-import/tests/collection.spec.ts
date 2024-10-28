import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should list available posts", async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      name: "The Day a Monkey Became Our Content Consultant",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "The Day a Penguin Became Our Tour Guide",
    }),
  ).toBeVisible();
});

test("should render post content", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "The Day a Monkey Became Our Content Consultant",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "Validators in a Jungle Jam" }),
  ).toBeVisible();
});

test("should render imported component", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "The Day a Penguin Became Our Tour Guide",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "Internship at ContentCrafter Inc." }),
  ).toBeVisible();
});
