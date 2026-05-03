import { test, expect } from "@playwright/test";

test.describe("locale toggle", () => {
  test("toggles from /no to /en and persists in cookie", async ({ page, context }) => {
    await page.goto("/no");
    await page.getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/?$/);

    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(localeCookie?.value).toBe("en");
  });

  test("toggling preserves the current page path", async ({ page }) => {
    await page.goto("/no/consulting");
    await page.getByRole("link", { name: "EN", exact: true }).click();
    await expect(page).toHaveURL(/\/en\/consulting/);
  });
});
