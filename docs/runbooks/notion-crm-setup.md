# Notion CRM setup — Crunchtime leads database

The `/api/lead` route writes one row per lead. After this setup, populate `NOTION_TOKEN` and `NOTION_DATABASE_ID` in `.env.local` (local) and Vercel env (Production + Preview + Development).

## 1. Create the integration

1. Visit https://www.notion.so/profile/integrations.
2. New integration -> Name: `Crunchtime Site`. Workspace: Christian's. Type: Internal.
3. Capabilities: Read content, Update content, Insert content. (No user-info access.)
4. Save. Copy the "Internal Integration Token" (starts with `secret_` or `ntn_`). This is `NOTION_TOKEN`.

## 2. Create the database

Create a full-page database called "Crunchtime Leads" with these properties (exact names — the API uses them as keys):

| Property | Type | Configuration |
|---|---|---|
| `Name` | Title | (rename auto Title column) |
| `Email` | Email | — |
| `Company` | Rich text | — |
| `Website` | URL | — |
| `Brief` | Rich text | — |
| `Recommendation` | Rich text | — |
| `Language` | Select | Options: `no`, `en` |
| `Source` | Select | Options: `brief-box-v1` |
| `Status` | Select | Options in this order/color: `new` (gray), `plan-pending` (yellow), `plan-delivered` (green), `plan-needs-review` (orange), `manual-review` (red) |
| `Created` | Created time | (system-managed) |
| `Plan Sent` | Date | Include time. Optional. |
| `Notes` | Rich text | — |

Add the Select options in advance — the API does not auto-create options on first write.

## 3. Share with the integration

Database page -> `...` menu -> Connections -> Add connections -> search "Crunchtime Site" -> confirm.

## 4. Copy the database ID

The 32-char hex string in the database URL: `https://www.notion.so/<workspace>/<DATABASE_ID>?v=<view_id>`. This is `NOTION_DATABASE_ID`.

## 5. Add env vars

`.env.local`:
```
NOTION_TOKEN=ntn_xxx...
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

In Vercel (Project Settings -> Environment Variables), add both for Production, Preview, and Development. Mark Sensitive.

## 6. Smoke test

After Plan 4 lands, hit the form on a preview deploy. A new row should appear in Notion within ~1s with Status = `new`.
