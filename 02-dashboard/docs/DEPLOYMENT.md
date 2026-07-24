# Deployment guide

## Supabase project

1. Create a Supabase project in the preferred region.
2. Connect the GitHub repository or apply every file in `supabase/migrations/` in timestamp order.
3. For this monorepo, set the Supabase GitHub integration working directory to `02-dashboard` because that directory contains `supabase/`.
4. Enable email/password authentication and email confirmation.
5. Set the production Site URL and allow both callback routes:
   - `https://your-domain.example/auth/callback`
   - `https://your-domain.example/auth/reset`
6. Confirm all tables appear under the `public` schema and show RLS enabled.
7. Run the two-account procedure in `docs/SECURITY_TEST.md`.

Supabase's hosted GitHub integration applies migrations but does not run `supabase/seed.sql`. Use the seed only for local or disposable testing. The assessment-only hosted seed is versioned separately so a clean project can be reproduced exactly.

## Application environment

Set these values in the hosting platform:

- `NEXT_PUBLIC_SUPABASE_URL` — API URL such as `https://project-ref.supabase.co`, not the dashboard URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — current Supabase publishable key (recommended).

`NEXT_PUBLIC_SUPABASE_ANON_KEY` is also accepted for projects still using the
legacy anonymous JWT key. Configure the values for both **Production** and
**Preview** before triggering a deployment; public environment values are
embedded into the browser bundle at build time, so changing them requires a
redeploy.

The publishable key is intentionally available to the browser. RLS is the authorization boundary. Never expose the service-role key.

## Frontend builds

Vercel uses the native `npm run build` command declared in `vercel.json` and
writes its framework output to `.next`. Use `npm run build:sites` when creating
the Cloudflare/Vinext bundle for the repository's Sites-compatible workflow.

## Release gate

1. Run `npm ci`.
2. Run `npm run check`.
3. Verify registration, confirmation, login, logout, and password recovery.
4. Verify create, read, update, and delete for companies, contacts, deals, and activities.
5. Verify global search returns only the authenticated user's records.
6. Run the two-account RLS test.
7. Confirm callback URLs and production environment values.
8. Run Lighthouse against the final production URL and record the result in the submission.

## Production hardening

- Delete assessment demo accounts and synthetic rows before onboarding customers.
- Enable point-in-time recovery, backups, database monitoring, and auth rate limits.
- Add error monitoring with customer-data redaction.
- Review RLS and function grants with every schema migration.
- Rotate secrets and validate restore procedures on a schedule.
