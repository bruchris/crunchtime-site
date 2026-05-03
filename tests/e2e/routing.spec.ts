import { test, expect } from "@playwright/test";

test.describe("locale routing", () => {
  test("root path redirects to /no when Accept-Language is Norwegian", async ({ browser }) => {
    const context = await browser.newContext({ locale: "no-NO" });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/no\/?$/);
    await context.close();
  });

  test("root path redirects to /en when Accept-Language is English", async ({ browser }) => {
    const context = await browser.newContext({ locale: "en-US" });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/en\/?$/);
    await context.close();
  });

  test("root path falls back to /no when Accept-Language is exotic", async ({ browser }) => {
    const context = await browser.newContext({ locale: "ja-JP" });
    const page = await context.newPage();
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/no\/?$/);
    await context.close();
  });

  test("/no/consulting renders Norwegian consulting page", async ({ page }) => {
    await page.goto("/no/consulting");
    await expect(page).toHaveURL(/\/no\/consulting/);
  });

  test("/en/consulting renders English consulting page", async ({ page }) => {
    await page.goto("/en/consulting");
    await expect(page).toHaveURL(/\/en\/consulting/);
  });
});
