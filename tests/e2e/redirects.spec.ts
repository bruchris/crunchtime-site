import { test, expect } from "@playwright/test";

test.describe("consulting -> services redirects", () => {
  test("/consulting redirects to /no/services", async ({ page }) => {
    const response = await page.goto("/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/services$/);
  });

  test("/no/consulting redirects to /no/services", async ({ page }) => {
    const response = await page.goto("/no/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/services$/);
  });

  test("/en/consulting redirects to /en/services", async ({ page }) => {
    const response = await page.goto("/en/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/en\/services$/);
  });

  test("/contact still redirects to /no/contact", async ({ page }) => {
    const response = await page.goto("/contact", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/contact$/);
  });
});
