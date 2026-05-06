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

  test("/no/services renders the Norwegian services page", async ({ page }) => {
    await page.goto("/no/services");
    await expect(page).toHaveURL(/\/no\/services$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI-team som faktisk gjør jobben/
    );
  });

  test("/en/services renders the English services page", async ({ page }) => {
    await page.goto("/en/services");
    await expect(page).toHaveURL(/\/en\/services$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI teams that actually do the work/
    );
  });

  test("/consulting (bare) 301-redirects to /no/services", async ({ page }) => {
    const response = await page.goto("/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/services$/);
  });

  test("/contact (bare) 301-redirects to /no/contact", async ({ page }) => {
    const response = await page.goto("/contact", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/contact/);
  });

  test("/back-office/finance returns 404", async ({ page }) => {
    const response = await page.goto("/back-office/finance");
    expect(response?.status()).toBe(404);
  });
});
