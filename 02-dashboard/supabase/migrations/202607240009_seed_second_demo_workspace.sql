-- Populate the second assessment account with a distinct mid-market workspace.
-- All rows remain subject to the same owner-scoped RLS policies as user-created data.
insert into public.companies (id, owner_id, name, domain, industry, size, location, annual_revenue)
values
  ('c2000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'Ember Finance', 'emberfinance.co', 'Financial Technology', '51–200', 'Denver, CO', 28000000),
  ('c2000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'Atlas Retail', 'atlasretail.com', 'Retail Technology', '201–500', 'Portland, OR', 62000000),
  ('c2000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 'Helio Logistics', 'heliologistics.io', 'Logistics', '51–200', 'Phoenix, AZ', 34000000)
on conflict (id) do nothing;

insert into public.contacts (id, owner_id, company_id, first_name, last_name, email, phone, title)
values
  ('b2000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', 'Iris', 'Cole', 'iris@emberfinance.co', '+1 720 555 0147', 'Director of Revenue Operations'),
  ('b2000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'Noah', 'Williams', 'noah@atlasretail.com', '+1 503 555 0182', 'VP, Digital Commerce'),
  ('b2000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000003', 'Leena', 'Shah', 'leena@heliologistics.io', '+1 602 555 0119', 'Chief Operating Officer')
on conflict (id) do nothing;

insert into public.deals (id, owner_id, company_id, contact_id, name, value, stage, probability, source, expected_close_date, closed_at, lost_reason)
values
  ('e2000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'Ember treasury rollout', 210000, 'proposal', 62, 'Inbound', current_date + 24, null, null),
  ('e2000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'Atlas commerce expansion', 160000, 'negotiation', 80, 'Partner', current_date + 12, null, null),
  ('e2000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', 'Helio route intelligence', 105000, 'qualified', 38, 'Outbound', current_date + 38, null, null),
  ('e2000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'Ember compliance workspace', 95000, 'closed_won', 100, 'Referral', current_date - 8, now() - interval '8 days', null),
  ('e2000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'Atlas regional launch', 130000, 'closed_won', 100, 'Event', current_date - 36, now() - interval '1 month', null),
  ('e2000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', 'Helio operations pilot', 80000, 'closed_lost', 0, 'Outbound', current_date - 16, now() - interval '14 days', 'Implementation window moved'),
  ('e2000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000002', 'c2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'Atlas team starter', 55000, 'lead', 15, 'Inbound', current_date + 52, null, null)
on conflict (id) do nothing;

insert into public.tags (id, owner_id, name, color)
values
  ('a2000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'Mid-market', '#60A5FA'),
  ('a2000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'Fast-moving', '#F59E0B')
on conflict (id) do nothing;

insert into public.deal_tags (id, owner_id, deal_id, tag_id)
values
  ('92000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000001', 'a2000000-0000-4000-8000-000000000001'),
  ('92000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000002', 'a2000000-0000-4000-8000-000000000002'),
  ('92000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000004', 'a2000000-0000-4000-8000-000000000001')
on conflict (id) do nothing;

insert into public.activities (id, owner_id, deal_id, contact_id, type, title, description, due_at, completed_at)
values
  ('82000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'call', 'Ember workflow discovery', 'Mapped the treasury approval workflow.', now() - interval '6 days', now() - interval '6 days'),
  ('82000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'meeting', 'Atlas stakeholder workshop', 'Aligned commerce and operations stakeholders.', now() - interval '4 days', now() - interval '4 days'),
  ('82000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', 'email', 'Helio integration brief', 'Shared the route data integration brief.', now() - interval '3 days', now() - interval '3 days'),
  ('82000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000004', 'b2000000-0000-4000-8000-000000000001', 'task', 'Ember handoff complete', 'Completed the sales-to-success handoff.', now() - interval '1 day', now() - interval '1 day'),
  ('82000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000002', 'b2000000-0000-4000-8000-000000000002', 'meeting', 'Atlas commercial review', 'Confirm pricing, rollout phases, and signature path.', now() + interval '1 day', null),
  ('82000000-0000-4000-8000-000000000006', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000001', 'b2000000-0000-4000-8000-000000000001', 'email', 'Send Ember proposal revision', 'Share the revised security and onboarding plan.', now() + interval '2 days', null),
  ('82000000-0000-4000-8000-000000000007', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000003', 'b2000000-0000-4000-8000-000000000003', 'call', 'Helio technical follow-up', 'Review API access and data availability.', now() + interval '3 days', null),
  ('82000000-0000-4000-8000-000000000008', 'd0000000-0000-4000-8000-000000000002', 'e2000000-0000-4000-8000-000000000007', 'b2000000-0000-4000-8000-000000000002', 'task', 'Prepare Atlas starter brief', 'Document the team use case and success criteria.', now() + interval '5 days', null)
on conflict (id) do nothing;
