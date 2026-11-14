# Beans & Brews

A modern ecommerce starter built with the Next.js App Router, TypeScript, Tailwind CSS, and shadcn/ui.

## Getting started

Install dependencies and start the development server:

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## UI components

Add shadcn/ui components with:

```bash
npx shadcn@latest add button
```

The shadcn/ui configuration is in `components.json`; app routes and layouts live in `src/app`.

## Storefront and authentication

The storefront includes product and collection pages, a journal, a persistent
shopping bag, sign-up and sign-in, a protected profile, and a protected
administrator area. The checkout currently records a demo order in the browser;
it does not process payments.

Copy `.env.example` to `.env.local` and set `DATABASE_URL`,
`BETTER_AUTH_SECRET` (at least 32 characters), `BETTER_AUTH_URL`, and
`BETTER_AUTH_TRUSTED_ORIGINS` (comma-separated origins allowed to call the auth
API and submit Server Actions). For a GitHub Codespaces preview, set both auth
URL variables to the preview origin, such as
`https://your-codespace-3000.app.github.dev` (no trailing slash), and restart
the development server. Local environment files are ignored by Git.

Generate and apply the Better Auth PostgreSQL schema with Drizzle:

```bash
pnpm db:generate
pnpm db:migrate
```

The first user has the `user` role. After applying migrations and starting the
app, create an initial administrator in another terminal:

```bash
pnpm admin:create
```

The command creates `admin@beans-brews.local` with a generated password and
prints the credentials once. Set `ADMIN_EMAIL`, `ADMIN_NAME`, and/or
`ADMIN_PASSWORD` in `.env.local` to choose your own values. It refuses to
promote an account that already exists. Keep the generated password private.
New public registrations always receive the `user` role, and the `/admin`
pages enforce the administrator role on the server.

## Admin content

The product description and journal article editors support headings, emphasis,
lists, quotes, and undo/redo. Blog posts can include a cover image, author,
category, tags, featured flag, and draft/published status; published articles
appear in the journal. Rich text is stored as Tiptap JSON. Apply database
migrations with `pnpm db:migrate` before using the new blog metadata fields.
