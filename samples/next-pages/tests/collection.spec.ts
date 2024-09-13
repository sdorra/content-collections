import { expect, test } from "@playwright/test";

test("should render posts overview", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "When Llamas Photobomb Your Selfie" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "When a Yak Stole My Notebook" }),
  ).toBeVisible();
});

test("should navigate to post", async ({ page }) => {
  await page.goto("/");

  const heading = await page.getByRole("heading", {
    name: "When Llamas Photobomb Your Selfie",
  });
  await heading.click();

  await expect(page).toHaveURL(new RegExp("/posts/llama-photobomb$"));
});

test("should render post", async ({ page }) => {
  await page.goto("/posts/yak-stole-my-notebook");

  await expect(
    page.getByRole("heading", { name: "When a Yak Stole My Notebook" }),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "The Collectors' Adventure" }),
  ).toBeVisible();
});
