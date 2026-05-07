import { test, expect } from "@playwright/test";

test.describe("lead capture form", () => {
  test("submits a valid payload and shows success", async ({ page }) => {
    let capturedPayload: Record<string, unknown> = {};

    await page.route("**/api/lead", async (route) => {
      capturedPayload = JSON.parse(route.request().postData() ?? "{}") as Record<string, unknown>;
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, leadId: "test-page-123" })
      });
    });

    // Stub /api/brief so the demo completes deterministically.
    await page.route("**/api/brief", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
          logs: [
            { agent: "AR", action: "did a thing", ts: "11:42" },
            { agent: "AR", action: "did another thing", ts: "11:43" },
            { agent: "AR", action: "did a third thing", ts: "11:44" }
          ],
          recommendation: { headline: "3 agenter, ~4t/uke spart.", ask: "Vil du sette opp?" }
        })
      });
    });

    await page.goto("/no");

    await page.getByPlaceholder(/fortell hva|tell us/i).fill("fakturaene er sene");
    await page.keyboard.press("Enter");

    const skip = page.getByRole("link", { name: /skip|hopp/i });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }

    await page.getByRole("button", { name: /send.*e-?post/i }).click();

    await page.getByLabel(/^navn$/i).fill("Ada Lovelace");
    await page.getByLabel(/e-?post/i).fill("ada@example.com");
    await page.getByLabel(/firma/i).fill("Analytical Engines AS");
    await page.getByLabel(/nettside/i).fill("https://example.com");

    await page.getByRole("button", { name: /send|submit/i }).last().click();

    await expect(page.getByText(/plan kommer|innen 30 min|takk/i)).toBeVisible({ timeout: 5000 });

    expect(capturedPayload).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines AS",
      website: "https://example.com",
      language: "no",
      source: "brief-box-v1",
      company_phone: ""
    });
    expect(capturedPayload.brief as string).toContain("fakturaene");
    expect((capturedPayload.demoPayload as { recommendation?: { headline?: string } })?.recommendation?.headline).toBeTruthy();
  });

  test("honeypot fill returns success without contacting downstream", async ({ request }) => {
    const response = await request.post("/api/lead", {
      data: {
        name: "Bot Bot", email: "bot@example.com", company: "Botco",
        website: "https://bot.example.com", notes: "", brief: "test",
        demoPayload: {
          agents: [{ name: "x", color: "lime", tools: ["a"] }],
          logs: [
            { agent: "x", action: "y", ts: "00:00" },
            { agent: "x", action: "z", ts: "00:01" },
            { agent: "x", action: "w", ts: "00:02" }
          ],
          recommendation: { headline: "h", ask: "a" }
        },
        language: "no", source: "brief-box-v1",
        company_phone: "+47 99 88 77 66"
      }
    });
    expect(response.status()).toBe(200);
    const body = await response.json() as Record<string, unknown>;
    expect(body).toEqual({ ok: true });
    expect(body.leadId).toBeUndefined();
  });

  test("invalid payload returns 400", async ({ request }) => {
    const response = await request.post("/api/lead", {
      data: { name: "", email: "not-an-email", company: "", website: "not-a-url" }
    });
    expect(response.status()).toBe(400);
    const body = await response.json() as Record<string, unknown>;
    expect(body.ok).toBe(false);
  });
});
