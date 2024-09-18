import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should have content for posts", async ({ page }) => {
  await expect(
    page.getByRole("heading", { name: "When a Parrot Became Our Tour Guide" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "When a Monkey Hijacked Our Drone" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "The Day a Kangaroo Borrowed My Camera",
    }),
  ).toBeVisible();
});

test("should navigate to post", async ({ page }) => {
  await page.goto("/");

  const heading = await page.getByRole("heading", {
    name: "When a Monkey Hijacked Our Drone",
  });
  await heading.click();

  await expect(page).toHaveURL(new RegExp("/posts/monkey$"));
});

test("should render post", async ({ page }) => {
  await page.goto("/posts/parrot");

  await expect(
    page.getByRole("heading", { name: "When a Parrot Became Our Tour Guide" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "The Validators' Hurdles: Polly's Peculiar Picks" }),
  ).toBeVisible();
});
