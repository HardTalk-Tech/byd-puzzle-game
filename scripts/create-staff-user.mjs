#!/usr/bin/env node
// Creates a staff login for the /staff dashboard.
//   1. Creates (or reuses) an Email/Password user in Firebase Authentication.
//   2. Tries to create the staff/{uid} document that grants dashboard access.
//      With the published firestore.rules nobody may write to `staff`, so if
//      that is refused the script prints the UID to add in the console.
// Uses the web config from .env.local / .env (no Admin SDK needed).
// Email/Password sign-in must be enabled in Firebase → Authentication.
//
// Usage: node scripts/create-staff-user.mjs <email> <password>
// Credentials are passed as arguments and never written to disk.

import { existsSync, readFileSync } from "node:fs";

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error("Usage: node scripts/create-staff-user.mjs <email> <password>");
  process.exit(1);
}

const env = {};
for (const file of [".env", ".env.local"]) {
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const apiKey = env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
if (!apiKey || !projectId) {
  console.error("NEXT_PUBLIC_FIREBASE_API_KEY / NEXT_PUBLIC_FIREBASE_PROJECT_ID missing in .env or .env.local");
  process.exit(1);
}

const authUrl = (method) => `https://identitytoolkit.googleapis.com/v1/accounts:${method}?key=${apiKey}`;
async function post(url, body, token) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  return { ok: res.ok, status: res.status, json: await res.json().catch(() => ({})) };
}

// 1. Create the user, or sign in if it already exists.
let session = await post(authUrl("signUp"), { email, password, returnSecureToken: true });
if (!session.ok && session.json.error?.message === "EMAIL_EXISTS") {
  console.log("User already exists – signing in to read its UID.");
  session = await post(authUrl("signInWithPassword"), { email, password, returnSecureToken: true });
}
if (!session.ok) {
  const msg = session.json.error?.message ?? `HTTP ${session.status}`;
  console.error(`Could not create the user: ${msg}`);
  if (msg.includes("CONFIGURATION_NOT_FOUND")) console.error("→ Open Firebase → Authentication → Get started.");
  if (msg.includes("OPERATION_NOT_ALLOWED")) console.error("→ Enable Email/Password in Authentication → Sign-in method.");
  if (msg.includes("WEAK_PASSWORD")) console.error("→ Use a password of at least 6 characters.");
  if (msg.includes("INVALID_LOGIN_CREDENTIALS") || msg.includes("INVALID_PASSWORD"))
    console.error("→ The user exists with a different password.");
  process.exit(1);
}
const { localId: uid, idToken } = session.json;
console.log(`Auth user ready: ${email}  UID: ${uid}`);

// 2. Grant dashboard access: staff/{uid}.
const docUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/staff?documentId=${uid}`;
const doc = await post(docUrl, { fields: { email: { stringValue: email } } }, idToken);
if (doc.ok) {
  console.log(`Created staff/${uid} – this account can now open /staff.`);
} else if (doc.json.error?.status === "ALREADY_EXISTS") {
  console.log(`staff/${uid} already exists – this account can already open /staff.`);
} else {
  console.log(`\nThe security rules don't allow creating staff/${uid} from here (${doc.json.error?.status ?? doc.status}). That is expected.`);
  console.log("Add it once in the Firebase console:");
  console.log("  Firestore → Data → Start collection (or open) `staff`");
  console.log(`  Document ID: ${uid}`);
  console.log(`  Field: email (string) = ${email}`);
}
