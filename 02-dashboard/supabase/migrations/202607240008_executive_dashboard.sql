-- Enrich the hosted assessment workspace with synthetic multi-channel data.
insert into public.companies (id, owner_id, name, domain, industry, size, location, annual_revenue)
values
  ('c1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Orion Cloud', 'orioncloud.com', 'Cloud Infrastructure', '501–1000', 'Seattle, WA', 128000000),
  ('c1000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Kinetic Systems', 'kinetic.systems', 'Enterprise Software', '201–500', 'Chicago, IL', 74000000),
  ('c1000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'Luma Health', 'lumahealth.com', 'Digital Health', '501–1000', 'Boston, MA', 156000000),
  ('c1000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'Meridian Group', 'meridiangroup.co', 'Professional Services', '1001–5000', 'Toronto, CA', 310000000)
on conflict (id) do nothing;

insert into public.contacts (id, owner_id, company_id, first_name, last_name, email, phone, title)
values
  ('b1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'Nina', 'Park', 'nina@orioncloud.com', '+1 206 555 0142', 'Chief Revenue Officer'),
  ('b1000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'Marcus', 'Lee', 'marcus@kinetic.systems', '+1 312 555 0188', 'VP, Operations'),
  ('b1000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'Sofia', 'Alvarez', 'sofia@lumahealth.com', '+1 617 555 0120', 'SVP, Commercial'),
  ('b1000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', 'Theo', 'Martin', 'theo@meridiangroup.co', '+1 416 555 0194', 'Managing Partner')
on conflict (id) do nothing;

insert into public.deals (id, owner_id, company_id, contact_id, name, value, stage, probability, source, expected_close_date, closed_at, lost_reason)
values
  ('e1000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'Orion platform expansion', 310000, 'negotiation', 82, 'Inbound', current_date + 18, null, null),
  ('e1000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'Kinetic data rollout', 240000, 'proposal', 58, 'Outbound', current_date + 33, null, null),
  ('e1000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000003', 'Luma enterprise agreement', 180000, 'closed_won', 100, 'Referral', current_date - 31, now() - interval '1 month', null),
  ('e1000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'c1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000004', 'Meridian sales transformation', 265000, 'closed_won', 100, 'Partner', current_date - 62, now() - interval '2 months', null),
  ('e1000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Northstar AI pilot', 88000, 'qualified', 36, 'Event', current_date + 45, null, null),
  ('e1000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Morrow regional renewal', 140000, 'closed_won', 100, 'Inbound', current_date - 93, now() - interval '3 months', null),
  ('e1000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'Arcwell proof of value', 72000, 'closed_lost', 0, 'Outbound', current_date - 14, now() - interval '12 days', 'Budget reallocated'),
  ('e1000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'Superlayer team expansion', 64000, 'lead', 14, 'Referral', current_date + 60, null, null)
on conflict (id) do nothing;

insert into public.activities (id, owner_id, deal_id, contact_id, type, title, description, due_at, completed_at)
values
  ('81000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'meeting', 'Orion executive alignment', 'Validated rollout goals with the executive sponsor.', now() - interval '6 days', now() - interval '6 days'),
  ('81000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'call', 'Kinetic technical discovery', 'Confirmed integration architecture and data owners.', now() - interval '5 days', now() - interval '5 days'),
  ('81000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000003', 'b1000000-0000-4000-8000-000000000003', 'email', 'Luma procurement follow-up', 'Closed the final procurement loop.', now() - interval '4 days', now() - interval '4 days'),
  ('81000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000004', 'b1000000-0000-4000-8000-000000000004', 'meeting', 'Meridian success review', 'Documented initial adoption milestones.', now() - interval '3 days', now() - interval '3 days'),
  ('81000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'call', 'Northstar pilot scoping', 'Agreed success criteria for the pilot.', now() - interval '2 days', now() - interval '2 days'),
  ('81000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000002', 'email', 'Morrow renewal confirmation', 'Shared the signed renewal summary.', now() - interval '1 day', now() - interval '1 day'),
  ('81000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000001', 'b1000000-0000-4000-8000-000000000001', 'meeting', 'Orion commercial close plan', 'Align legal, security, and signature sequence.', now() + interval '1 day', null),
  ('81000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000002', 'b1000000-0000-4000-8000-000000000002', 'call', 'Kinetic proposal review', 'Walk through pricing and implementation plan.', now() + interval '2 days', null),
  ('81000000-0000-4000-8000-000000000009', 'd0000000-0000-4000-8000-000000000001', 'e1000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000001', 'task', 'Prepare Northstar pilot brief', 'Package timeline, owners, and success metrics.', now() + interval '3 days', null)
on conflict (id) do nothing;

create or replace function public.get_dashboard_analytics()
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with user_deals as (
    select * from public.deals where owner_id = auth.uid()
  ),
  metrics as (
    select
      coalesce(sum(value) filter (where stage not in ('closed_won', 'closed_lost')), 0) as pipeline_value,
      coalesce(sum(value) filter (where stage = 'closed_won' and closed_at >= date_trunc('month', now())), 0) as won_revenue,
      round(100.0 * count(*) filter (where stage = 'closed_won') / nullif(count(*) filter (where stage in ('closed_won', 'closed_lost')), 0), 1) as win_rate,
      coalesce(avg(value), 0) as average_deal_size,
      count(*) filter (where stage not in ('closed_won', 'closed_lost')) as open_deals
    from user_deals
  ),
  revenue as (
    select jsonb_agg(jsonb_build_object('month', to_char(month, 'Mon'), 'revenue', revenue, 'target', 0) order by month) as data
    from (select month, revenue from public.monthly_revenue where owner_id = auth.uid() order by month desc limit 6) months
  ),
  pipeline as (
    select jsonb_agg(jsonb_build_object('stage', initcap(replace(stage::text, '_', ' ')), 'value', value, 'deals', deals) order by case stage when 'lead' then 1 when 'qualified' then 2 when 'proposal' then 3 when 'negotiation' then 4 end) as data
    from public.pipeline_by_stage where owner_id = auth.uid()
  ),
  funnel as (
    select jsonb_agg(jsonb_build_object('stage', stage_label, 'deals', deals, 'value', value) order by stage_order) as data
    from (
      select stages.stage_order, stages.stage_label, count(d.id)::integer as deals, coalesce(sum(d.value), 0)::numeric as value
      from (values (1, 'lead', 'Lead'), (2, 'qualified', 'Qualified'), (3, 'proposal', 'Proposal'), (4, 'negotiation', 'Negotiation'), (5, 'closed_won', 'Closed won')) as stages(stage_order, stage_key, stage_label)
      left join user_deals d on d.stage::text = stages.stage_key
      group by stages.stage_order, stages.stage_label
    ) funnel_counts
  ),
  sources as (
    select jsonb_agg(jsonb_build_object('source', source, 'deals', deals, 'value', value) order by deals desc) as data
    from (select source, count(*)::integer as deals, coalesce(sum(value), 0)::numeric as value from user_deals group by source) source_counts
  ),
  activity_stats as (
    select jsonb_agg(jsonb_build_object('day', to_char(day, 'Dy'), 'completed', completed) order by day) as data
    from (
      select series.day::date as day, count(a.id)::integer as completed
      from generate_series(current_date - interval '6 days', current_date, interval '1 day') as series(day)
      left join public.activities a on a.owner_id = auth.uid() and date_trunc('day', a.completed_at)::date = series.day::date
      group by series.day
    ) days
  )
  select jsonb_build_object(
    'metrics', jsonb_build_object(
      'pipelineValue', metrics.pipeline_value,
      'wonRevenue', metrics.won_revenue,
      'winRate', coalesce(metrics.win_rate, 0),
      'averageDealSize', metrics.average_deal_size,
      'openDeals', metrics.open_deals,
      'overdueActivities', (select count(*) from public.activities where owner_id = auth.uid() and completed_at is null and due_at < now()),
      'pipelineDelta', 0,
      'revenueDelta', 0
    ),
    'monthlyRevenue', coalesce(revenue.data, '[]'::jsonb),
    'pipelineByStage', coalesce(pipeline.data, '[]'::jsonb),
    'conversionFunnel', coalesce(funnel.data, '[]'::jsonb),
    'dealsBySource', coalesce(sources.data, '[]'::jsonb),
    'activitiesCompleted', coalesce(activity_stats.data, '[]'::jsonb)
  )
  from metrics, revenue, pipeline, funnel, sources, activity_stats;
$$;

revoke all on function public.get_dashboard_analytics() from public;
revoke all on function public.get_dashboard_analytics() from anon;
grant execute on function public.get_dashboard_analytics() to authenticated;
