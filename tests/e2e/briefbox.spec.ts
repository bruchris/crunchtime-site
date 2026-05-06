import { test, expect, type Page } from "@playwright/test";

// Canned payload used by route stubs — satisfies the BriefResponse schema.
const CANNED_PAYLOAD = {
  agents: [
    { name: "AR-spesialist", color: "lime", tools: ["stripe", "tripletex", "gmail"] },
    { name: "Cashflow", color: "amber", tools: ["fiken"] }
  ],
  logs: [
    { agent: "AR-spesialist", action: "skrev 7 påminnelser", ts: "11:42" },
    { agent: "Cashflow", action: "flagget 3 over 30d", ts: "11:43" },
    { agent: "AR-spesialist", action: "fullførte analyse", ts: "11:44" }
  ],
  recommendation: {
    headline: "3 agenter, ~4t/uke spart.",
    ask: "Vil du ha dette satt opp på ekte for bedriften din?"
  }
};

/**
 * Stub /api/brief to return a deterministic canned payload without hitting
 * the Anthropic API. All tests that exercise the animated demo use this.
 */
async function stubBriefApi(page: Page) {
  await page.route("**/api/brief", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(CANNED_PAYLOAD)
    });
  });
}

test.describe("Brief Box demo", () => {
  test("renders headline, input, and 4 chips on /no", async ({ page }) => {
    await page.goto("/no");

    // Headline
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Slipp en utfordring/);

    // Input
    await expect(page.getByPlaceholder("fortell hva som koker...")).toBeVisible();

    // 4 chip buttons — ChipRow renders <button> elements, not list items.
    await expect(page.getByRole("button", { name: "fakturaene er sene" })).toBeVisible();
    await expect(page.getByRole("button", { name: "vi mister leads" })).toBeVisible();
    await expect(page.getByRole("button", { name: "e-post tar over livet" })).toBeVisible();
    await expect(page.getByRole("button", { name: "kundeservice koker" })).toBeVisible();
  });

  test("renders English copy on /en", async ({ page }) => {
    await page.goto("/en");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Drop a challenge/);
    // At least one English chip is visible.
    await expect(page.getByRole("button", { name: "invoices are slow" })).toBeVisible();
  });

  test("clicking a chip submits and renders the demo stage", async ({ page }) => {
    await stubBriefApi(page);
    await page.goto("/no");

    await page.getByRole("button", { name: "fakturaene er sene" }).click();

    // Agent cards are <article> elements — at least one appears.
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 });

    // End card should appear within ~14s of the scheduler completing.
    await expect(page.getByRole("link", { name: /Book en 30-min prat/i })).toBeVisible({
      timeout: 20_000
    });
  });

  test("skip link appears mid-demo and jumps to end card", async ({ page }) => {
    await stubBriefApi(page);
    await page.goto("/no");

    await page.getByRole("button", { name: "fakturaene er sene" }).click();

    // Skip button is rendered by SkipLink when phase !== idle and !== end-card.
    const skip = page.getByRole("button", { name: /skip til resultat/i });
    await expect(skip).toBeVisible({ timeout: 5_000 });
    await skip.click();

    // After skip, end card should be immediately visible.
    await expect(page.getByRole("link", { name: /Book en 30-min prat/i })).toBeVisible();
  });

  test("end card shows the email form when 'Send dette på e-post' is clicked", async ({ page }) => {
    await stubBriefApi(page);
    await page.goto("/no");

    await page.getByRole("button", { name: "fakturaene er sene" }).click();

    // Skip straight to end card.
    await page.getByRole("button", { name: /skip til resultat/i }).click();

    // Expand email form.
    await page.getByRole("button", { name: /Send dette på e-post/i }).click();

    // EmailCaptureForm fields — located by aria-label values from no.json translations.
    await expect(page.getByLabel("e-post")).toBeVisible();
    await expect(page.getByLabel("firmanavn")).toBeVisible();
    await expect(page.getByLabel(/nettside/i)).toBeVisible();
  });

  test("empty submit shows the tooltip", async ({ page }) => {
    await page.goto("/no");

    // Press Enter on an empty input — BriefInput shows the empty-validation alert.
    await page.getByPlaceholder("fortell hva som koker...").press("Enter");

    // Next.js also injects a route-announcer with role="alert"; target the tooltip paragraph specifically.
    await expect(page.locator("p[role='alert']")).toContainText(/skriv et reelt problem/);
  });
});
