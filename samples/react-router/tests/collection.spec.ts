import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("should list available posts", async ({ page }) => {
  await expect(
    page.getByRole("heading", {
      name: "Our Office Iguana Became the HR Manager",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Our Weather Forecast Was Hijacked By A Stand-up Comedian Seagull",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Our Weather Station Got Outsmarted By A Meteorologist Meerkat",
    }),
  ).toBeVisible();
});

test("should render post content", async ({ page }) => {
  const link = await page.getByRole("heading", {
    name: "Our Weather Forecast Was Hijacked By A Stand-up Comedian Seagull",
  });
  await link.click();

  await expect(
    page.getByRole("heading", { name: "When Nature Meets Comedy" }),
  ).toBeVisible();
});
