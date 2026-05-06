import { test, expect } from "@playwright/test";

test.describe("/no/contact page", () => {
  test("renders calendar iframe and contact form", async ({ page }) => {
    await page.goto("/no/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Book en prat eller skriv til oss/
    );
    const iframe = page.locator("iframe[title='Crunchtime booking calendar']");
    await expect(iframe).toBeVisible();
    await expect(page.getByLabel("Navn")).toBeVisible();
    await expect(page.getByLabel("E-post")).toBeVisible();
    await expect(page.getByLabel("Firma")).toBeVisible();
    await expect(page.getByLabel("Hva vil du ta av planka?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send melding" })).toBeVisible();
  });

  test("does not render the legacy cards / metrics / marquee", async ({ page }) => {
    await page.goto("/no/contact");
    await expect(page.locator(".accent-panel")).toHaveCount(0);
    await expect(page.getByText("No commitment")).toHaveCount(0);
  });

  test("/en/contact renders English copy", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Book a call or write to us/
    );
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
  });

  test("success state shows after ?sent=1", async ({ page }) => {
    await page.goto("/no/contact?sent=1");
    await expect(page.getByText("Mottatt.")).toBeVisible();
    await expect(page.getByText(/innen én arbeidsdag/)).toBeVisible();
  });
});
