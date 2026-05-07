#!/usr/bin/env node
// Push Brief Box / Lead / Paperclip env vars to Vercel for all three
// environments (production + preview + development) in one POST per var.
//
//   node scripts/push-vercel-envs.mjs            # upsert (replaces existing)
//   node scripts/push-vercel-envs.mjs --dry-run  # show plan, do nothing
//
// Talks directly to the Vercel REST API using Node's fetch + the Vercel
// CLI's stored token. Avoids the CLI's `vercel env add ... preview --yes`
// path which keeps choking on a phantom git_branch_required error on this
// machine.

import { readFileSync } from "node:fs";

const DRY = process.argv.includes("--dry-run");

const VARS = [
  "ANTHROPIC_API_KEY",
  "NOTION_TOKEN",
  "NOTION_DATABASE_ID",
  "PAPERCLIP_API_BASE",
  "PAPERCLIP_API_TOKEN",
  "PAPERCLIP_COMPANY_ID",
  "PAPERCLIP_PROJECT_ID",
  "PAPERCLIP_GOAL_ID",
  "PAPERCLIP_AGENT_ID"
];

// Vercel "type" values: encrypted (default), sensitive (write-only), plain.
const SENSITIVE = new Set([
  "ANTHROPIC_API_KEY",
  "NOTION_TOKEN",
  "PAPERCLIP_API_TOKEN"
]);

const project = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
const projectId = project.projectId;
const teamId = project.orgId;

const authPath = process.platform === "win32"
  ? `${process.env.APPDATA}/com.vercel.cli/Data/auth.json`
  : `${process.env.HOME}/.local/share/com.vercel.cli/auth.json`;
const auth = JSON.parse(readFileSync(authPath, "utf8"));
const token = auth.token;

function parseDotenv(text) {
  const out = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (!m) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    out[m[1]] = val;
  }
  return out;
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json"
};

async function vapi(method, path, body) {
  const url = `https://api.vercel.com${path}${path.includes("?") ? "&" : "?"}teamId=${teamId}`;
  const r = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  const text = await r.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* not json */ }
  return { status: r.status, ok: r.ok, body: json ?? text };
}

const env = parseDotenv(readFileSync(".env.local", "utf8"));

const results = [];
for (const name of VARS) {
  const value = env[name];
  if (!value) {
    results.push(`SKIP ${name}: missing in .env.local`);
    continue;
  }
  if (DRY) {
    results.push(`DRY  ${name.padEnd(22)} value=<${value.length} chars>`);
    continue;
  }

  // Find existing entries with this key and delete them, so that we can
  // re-create in one call (POST, not PATCH per id).
  const list = await vapi("GET", `/v10/projects/${projectId}/env`);
  if (list.ok && Array.isArray(list.body?.envs)) {
    for (const e of list.body.envs.filter((e) => e.key === name)) {
      await vapi("DELETE", `/v10/projects/${projectId}/env/${e.id}`);
    }
  }

  // Sensitive (write-only) vars cannot target `development` per Vercel —
  // local dev should use .env.local for those anyway.
  const isSensitive = SENSITIVE.has(name);
  const payload = {
    key: name,
    value,
    type: isSensitive ? "sensitive" : "encrypted",
    target: isSensitive
      ? ["production", "preview"]
      : ["production", "preview", "development"]
  };
  const res = await vapi("POST", `/v10/projects/${projectId}/env?upsert=true`, payload);

  if (res.ok) {
    results.push(`OK   ${name}`);
  } else {
    const msg = (res.body && (res.body.error?.message || res.body.message)) || JSON.stringify(res.body).slice(0, 200);
    results.push(`FAIL ${name}: ${res.status} ${msg}`);
  }
}

console.log(results.join("\n"));
