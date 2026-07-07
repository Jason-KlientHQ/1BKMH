import { test, expect } from "@playwright/test";

test.describe("Explore HUD", () => {
  test("opens destination menu after birthday is calculated", async ({ page }) => {
    await page.goto("/?b=1990-06-15");

    await expect(page.getByTestId("explore-trigger")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("explore-trigger").click();

    const menu = page.getByTestId("explore-menu");
    await expect(menu).toBeVisible();
    await expect(menu.getByRole("button", { name: /Sirius/i })).toBeVisible();

    const box = await menu.boundingBox();
    expect(box).not.toBeNull();
    if (box) expect(box.height).toBeGreaterThan(80);
  });

  test("restores true orbits from share URL", async ({ page }) => {
    await page.goto("/?b=1990-06-15&orbits=1");
    await expect(page.getByTestId("explore-trigger")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole("button", { name: /True orbits/i })).toBeVisible();
  });
});