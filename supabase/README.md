# Database

Postgres on Supabase, project ref `lawgakbbrfhauyxvftef`. The repo is connected
through the GitHub integration, so **anything added to `migrations/` is applied
to production when it reaches `main`**. A push is a schema change, not just a
site deploy.

## Layout

```
supabase/
  config.toml                                      identifies the project
  migrations/
    20260701000000_init_kaira_crm.sql              leads + events, RLS on
    20260722090000_stats_views_and_constraints.sql aggregate views, CHECKs
```

## Adding a migration

Create `migrations/<UTC timestamp>_<description>.sql`. They run in filename
order, so the timestamp must be later than every existing one.

Two rules, because these run against production unattended:

1. **Idempotent.** Use `if not exists`, `create or replace`, or a `do $$` block
   that checks `pg_constraint` / `pg_class` first. A migration may be re-run if
   its record is ever lost, and it must not fail the second time.
2. **Never destructive without a plan.** No `drop`, `truncate`, `delete` or
   `alter column` unless the data loss is intended and backed up first. There is
   no undo on a migration that has already run.

Add constraints as `not valid` so existing rows are never rejected mid-run,
then `validate constraint` separately once you have confirmed no row violates
it. `20260722090000` shows the pattern, including the queries that find
offending rows.

## Access model

RLS is on for both tables with **no policies**, deliberately. Only the
`service_role` key can read or write, and that key is used exclusively
server-side in `api/_supabase.js`. The public anon key can reach nothing.

The aggregate views are `security_invoker`, so they inherit the underlying
tables' RLS rather than running as their owner, plus explicit `revoke` from
`anon` and `authenticated`. A plain view over an RLS table would otherwise be
readable with the public key. If you add a view, do the same.

## Backups

**Supabase's free plan takes none.** The `leads` table is customer enquiries
with no recovery path if it is lost. Until the project is on a paid plan, take
a manual dump regularly and keep it off Supabase:

```
supabase db dump --db-url "<connection string>" -f backup-YYYY-MM-DD.sql
```

Or export `leads` to CSV from the dashboard table editor. Do this before
running any migration that alters or removes data.

## Health check

The app writes an `events` row of type `lead` alongside every `leads` row, so
these two counts should always match:

```sql
select (select count(*) from leads)                      as lead_rows,
       (select count(*) from events where type = 'lead') as lead_events;
```

Drift means lead inserts are failing. That is how two lost leads were found on
2 and 3 July 2026: three lead events existed against one row. `api/kaira-lead.js`
now retries once and returns 502 when a lead reaches neither the database nor
the inbox, and logs every failure — check the Vercel function logs.
