import { test, expect } from "@playwright/test";

test("should render mdx client component", async ({ page }) => {
  await page.goto("/client");

  await expect(page.getByRole("heading", { name: "Posts (use client)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qui reprehenderit et" })).toBeVisible();
});

test("should render mdx server component", async ({ page }) => {
  await page.goto("/server");

  await expect(page.getByRole("heading", { name: "Posts (RSC)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "One" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Qui reprehenderit et" })).toBeVisible();
});