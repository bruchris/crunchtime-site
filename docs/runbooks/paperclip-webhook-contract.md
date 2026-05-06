# Paperclip research-agent webhook contract (v1)

The Crunchtime site fires a webhook to Paperclip after every accepted lead. Paperclip runs the research agent (website scrape + LinkedIn lookup + plan generation), emails the resulting plan to the visitor (reply-to `christian@crunchtime.no`), and updates the Notion CRM row.

## Endpoint
- **Method:** `POST`
- **URL:** value of `PAPERCLIP_WEBHOOK_URL`.
- **Auth:** none for v1. (Future: HMAC `X-Crunchtime-Signature`.)
- **Content-Type:** `application/json; charset=utf-8`
- **Caller timeout:** 10s per attempt.
- **Retry:** 3 attempts total; first immediate, then 1s and 4s backoff.

## Request body
```json
{
  "lead_id": "21d4...8a",
  "brief": "fakturaene våre er sene...",
  "recommendation": {
    "headline": "3 agenter, ~4t/uke spart.",
    "ask": "Vil du ha dette satt opp på ekte for bedriften din?"
  },
  "visitor": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "company": "Analytical Engines AS",
    "website": "https://example.com"
  },
  "language": "no",
  "demo_payload": {
    "agents": [{ "name": "AR-spesialist", "color": "lime", "tools": ["stripe", "tripletex"] }],
    "logs": [{ "agent": "AR-spesialist", "action": "drafted 7 chase emails", "ts": "11:42" }],
    "recommendation": { "headline": "...", "ask": "..." }
  },
  "notion_url": "https://www.notion.so/<workspace>/<page>"
}
```

Field notes:
- `lead_id` is the Notion page ID. Paperclip uses it to update the row.
- Top-level `recommendation` duplicates `demo_payload.recommendation` for receiver convenience.
- `language` is `"no"` or `"en"`. Plan generation must respect it.

## Expected response
- **2xx:** `{ "accepted": true, "job_id": "pc_job_abc123" }`. Caller treats any 2xx as success; `job_id` logged.
- **4xx:** caller does NOT retry. Logs body, marks Notion `manual-review` immediately.
- **5xx or network error:** caller retries per schedule. After the 3rd failure, marks Notion `manual-review`.
- **Non-JSON 2xx:** treated as success.

## Paperclip side responsibilities (not in this repo)
1. Patch Notion row to `plan-pending`.
2. Run pipeline (scrape, lookup, plan template).
3. Sanity guards (>=500 chars, references scraped data, >=2 agents).
4. On pass: email plan via Resend (reply-to `christian@crunchtime.no`); patch Notion to `plan-delivered`, set `Plan Sent`.
5. On guard fail: patch Notion to `plan-needs-review`; email Christian a "review needed" notification; do NOT email the visitor.

The Crunchtime site does not poll. Notion is the shared state.
