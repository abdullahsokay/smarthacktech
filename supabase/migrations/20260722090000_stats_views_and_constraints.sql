-- ============================================================
-- KAIRA CRM — migration 01
-- Run once in Supabase -> SQL Editor. Safe to re-run (idempotent).
--
-- Fixes two counting bugs and adds data-integrity constraints.
--
-- WHY: api/admin.js pulls raw rows and counts them in JavaScript:
--        leads  ... limit=300
--        events ... limit=10000     <-- no ORDER BY
--      So the lead total freezes at 300, and once events exceed 10k
--      Postgres may return any arbitrary 10k rows, making
--      opens/messages/blueprints/audits a sample rather than a total.
--      The views below aggregate server-side, so counts stay exact
--      no matter how large the tables get.
-- ============================================================

-- ---------- 1. integrity constraints ----------
-- Added NOT VALID so existing rows are never rejected at migration time;
-- they apply to all new writes immediately. Before running VALIDATE below,
-- check for offenders with the queries in section 4.

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'leads_tier_chk') then
    alter table leads add constraint leads_tier_chk
      check (tier is null or tier in ('Hot','Warm','Cold')) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'leads_len_chk') then
    alter table leads add constraint leads_len_chk check (
      length(coalesce(name,''))     <= 200  and
      length(coalesce(email,''))    <= 200  and
      length(coalesce(company,''))  <= 200  and
      length(coalesce(industry,'')) <= 200  and
      length(coalesce(budget,''))   <= 200  and
      length(coalesce(timeline,'')) <= 200  and
      length(coalesce(context,''))  <= 4000
    ) not valid;
  end if;

  if not exists (select 1 from pg_constraint where conname = 'events_type_chk') then
    alter table events add constraint events_type_chk
      check (type in ('open','message','blueprint','audit','lead')) not valid;
  end if;
end $$;

-- ---------- 2. index supporting the aggregates ----------
create index if not exists events_type_created_idx on events (type, created_at desc);

-- ---------- 3. server-side aggregate views ----------
-- security_invoker makes each view run as the CALLER, so it inherits the
-- underlying table's RLS. Without it a view runs as its owner and would
-- expose rows to the public anon key. The explicit REVOKEs are a second
-- layer, because Supabase grants on public schema can be permissive.

create or replace view kaira_event_totals
  with (security_invoker = true) as
select
  count(*) filter (where type = 'open')      as opens,
  count(*) filter (where type = 'message')   as messages,
  count(*) filter (where type = 'blueprint') as blueprints,
  count(*) filter (where type = 'audit')     as audits,
  count(*) filter (where type = 'lead')      as lead_events,
  count(*)                                   as total_events
from events;

create or replace view kaira_lead_totals
  with (security_invoker = true) as
select
  count(*)                                as total,
  count(*) filter (where tier = 'Hot')    as hot,
  count(*) filter (where tier = 'Warm')   as warm,
  count(*) filter (where tier = 'Cold')   as cold,
  max(created_at)                         as latest
from leads;

-- Trend bucketed in Asia/Karachi, not UTC, so "today" matches the business day.
create or replace view kaira_lead_trend
  with (security_invoker = true) as
select
  (timezone('Asia/Karachi', created_at))::date as day,
  count(*)                                     as count
from leads
where created_at >= now() - interval '7 days'
group by 1
order by 1;

revoke all on kaira_event_totals from anon, authenticated;
revoke all on kaira_lead_totals  from anon, authenticated;
revoke all on kaira_lead_trend   from anon, authenticated;

-- ---------- 4. checks to run BEFORE validating the constraints ----------
-- Expect 0 rows from each. If any return rows, clean them, then run the
-- VALIDATE statements in section 5.
--
--   select id, tier from leads
--    where tier is not null and tier not in ('Hot','Warm','Cold');
--
--   select id, type from events
--    where type not in ('open','message','blueprint','audit','lead');
--
--   select id from leads
--    where length(coalesce(name,'')) > 200
--       or length(coalesce(email,'')) > 200
--       or length(coalesce(company,'')) > 200
--       or length(coalesce(industry,'')) > 200
--       or length(coalesce(budget,'')) > 200
--       or length(coalesce(timeline,'')) > 200
--       or length(coalesce(context,'')) > 4000;

-- ---------- 5. run only after section 4 returns nothing ----------
--   alter table leads  validate constraint leads_tier_chk;
--   alter table leads  validate constraint leads_len_chk;
--   alter table events validate constraint events_type_chk;
