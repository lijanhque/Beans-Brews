import { randomBytes } from "node:crypto";
import nextEnv from "@next/env";
import postgres from "postgres";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to create the administrator.");
}

const appUrl = new URL(process.env.BETTER_AUTH_URL ?? "http://localhost:3000");
const email = process.env.ADMIN_EMAIL ?? "admin@beans-brews.local";
const name = process.env.ADMIN_NAME ?? "Beans & Brews Admin";
const password =
  process.env.ADMIN_PASSWORD ?? randomBytes(24).toString("base64url");
const sql = postgres(databaseUrl, { prepare: false, max: 1 });

try {
  const [existingUser] = await sql`
    SELECT id FROM "user" WHERE lower(email) = lower(${email}) LIMIT 1
  `;
  if (existingUser) {
    throw new Error(
      `An account for ${email} already exists. No changes were made.`,
    );
  }

  const response = await fetch(
    new URL("/api/auth/sign-up/email", appUrl.origin),
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: appUrl.origin,
      },
      body: JSON.stringify({ name, email, password }),
    },
  );
  const result = await response.json();

  if (!response.ok || typeof result?.user?.id !== "string") {
    throw new Error(
      `Could not create the administrator account (HTTP ${response.status}).`,
    );
  }

  const [admin] = await sql`
    UPDATE "user"
    SET role = 'admin'
    WHERE id = ${result.user.id} AND lower(email) = lower(${email})
    RETURNING id
  `;
  if (!admin) {
    throw new Error("The new account could not be assigned the admin role.");
  }

  console.log(`Admin account created.
Email: ${email}
Password: ${password}`);
} finally {
  await sql.end();
}
