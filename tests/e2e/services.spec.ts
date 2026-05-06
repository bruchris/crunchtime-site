import { test, expect } from "@playwright/test";

test.describe("/no/services page", () => {
  test("renders eyebrow, headline, all section labels", async ({ page }) => {
    await page.goto("/no/services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI-team som faktisk gjør jobben/
    );
    await expect(page.getByText("AI-automatisering og agenter")).toBeVisible();
    await expect(page.getByText("Kartlegging")).toBeVisible();
    await expect(page.getByText("Discovery Sprint")).toBeVisible();
    await expect(page.getByText("Det vi får spørsmål om.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Book en gratis samtale/ })).toBeVisible();
  });

  test("FAQ items expand on click", async ({ page }) => {
    await page.goto("/no/services");
    const safetySummary = page.getByText("Er dette trygt? AI hallusinerer.");
    await safetySummary.click();
    await expect(page.getByText(/Hver agent vi sender ut har avgrenset scope/)).toBeVisible();
  });

  test("brief-handoff callout shows when ?from-brief is set", async ({ page }) => {
    await page.goto("/no/services?from-brief=fakturaene%20er%20sene");
    await expect(page.getByText(/Du kom hit fra en brief om/)).toBeVisible();
    await expect(page.getByText(/fakturaene er sene/)).toBeVisible();
  });

  test("brief-handoff callout dismisses", async ({ page }) => {
    await page.goto("/no/services?from-brief=fakturaene%20er%20sene");
    const callout = page.getByRole("complementary");
    await expect(callout).toBeVisible();
    await callout.getByRole("button").click();
    await expect(callout).toBeHidden();
  });

  test("/en/services renders English copy", async ({ page }) => {
    await page.goto("/en/services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI teams that actually do the work/
    );
    await expect(page.getByText("AI automation and agents")).toBeVisible();
    await expect(page.getByText("Discovery Sprint")).toBeVisible();
  });
});
