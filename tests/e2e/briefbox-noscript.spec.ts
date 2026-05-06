import { test, expect } from "@playwright/test";

test("POST /api/brief-noscript renders fallback HTML in Norwegian", async ({ request }) => {
  const res = await request.post("/api/brief-noscript", {
    form: { brief: "fakturaene er sene", lang: "no" }
  });
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("AR-spesialist");
  expect(html).toContain("Kundeservice");
  expect(html).toMatch(/Book en 30-min prat/);
});

test("POST /api/brief-noscript renders fallback HTML in English", async ({ request }) => {
  const res = await request.post("/api/brief-noscript", {
    form: { brief: "we keep losing leads", lang: "en" }
  });
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("SDR");
  expect(html).toContain("Researcher");
});
