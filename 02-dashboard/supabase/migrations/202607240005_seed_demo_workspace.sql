-- One-time hosted demo workspace seed.
-- This account owns only synthetic assessment data and can be removed before launch.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'alex@pipelineos.demo',
  crypt('PipelineOS-demo-2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alex Morgan"}', now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into public.companies (id, owner_id, name, domain, industry, size, location, annual_revenue)
values
  ('c0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Northstar Labs', 'northstarlabs.ai', 'Artificial Intelligence', '51–200', 'San Francisco, CA', 18200000),
  ('c0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Morrow', 'morrow.co', 'Financial Services', '201–500', 'New York, NY', 46000000),
  ('c0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'Arcwell', 'arcwell.io', 'Healthcare', '51–200', 'Austin, TX', 12400000),
  ('c0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'Superlayer', 'superlayer.dev', 'Developer Tools', '11–50', 'Remote', 6800000),
  ('c0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 'River & Co.', 'riverandco.com', 'E-commerce', '201–500', 'London, UK', 54000000)
on conflict (id) do nothing;

insert into public.contacts (id, owner_id, company_id, first_name, last_name, email, phone, title)
values
  ('b0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Maya', 'Chen', 'maya@northstarlabs.ai', '+1 415 555 0134', 'VP, Revenue'),
  ('b0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'Jon', 'Bell', 'jon@morrow.co', '+1 212 555 0191', 'Chief Operating Officer'),
  ('b0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'Priya', 'Rao', 'priya@arcwell.io', '+1 512 555 0175', 'Head of Operations'),
  ('b0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'Evan', 'Brooks', 'evan@superlayer.dev', null, 'Founder & CEO'),
  ('b0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000005', 'Amelia', 'Hart', 'amelia@riverandco.com', '+44 20 7946 0184', 'Commercial Director')
on conflict (id) do nothing;

insert into public.deals (
  id, owner_id, company_id, contact_id, name, value, stage,
  probability, source, expected_close_date, closed_at
)
values
  ('e0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'Northstar enterprise rollout', 184000, 'negotiation', 78, 'Inbound', '2026-08-12', null),
  ('e0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'Morrow global workspace', 126000, 'proposal', 58, 'Referral', '2026-08-28', null),
  ('e0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'Arcwell operations suite', 92000, 'qualified', 34, 'Outbound', '2026-09-05', null),
  ('e0000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000004', 'Superlayer growth plan', 48000, 'lead', 18, 'Event', '2026-09-18', null),
  ('e0000000-0000-4000-8000-000000000005', 'd0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'River & Co. commerce team', 216000, 'closed_won', 100, 'Partner', '2026-07-18', '2026-07-16')
on conflict (id) do nothing;

insert into public.tags (id, owner_id, name, color)
values
  ('a0000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'Expansion', '#b8f34a'),
  ('a0000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'Strategic', '#c8b6ff'),
  ('a0000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'Fast-track', '#f9c74f')
on conflict (id) do nothing;

insert into public.deal_tags (id, owner_id, deal_id, tag_id)
values
  ('90000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002'),
  ('90000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001'),
  ('90000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003')
on conflict (deal_id, tag_id) do nothing;

insert into public.activities (id, owner_id, deal_id, contact_id, type, title, description, due_at, completed_at)
values
  ('80000000-0000-4000-8000-000000000001', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000001', 'meeting', 'Commercial review with Maya', 'Align procurement, legal, and rollout milestones.', '2026-07-24 15:30:00+00', null),
  ('80000000-0000-4000-8000-000000000002', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'email', 'Send security responses', 'Share completed vendor questionnaire.', '2026-07-25 10:00:00+00', null),
  ('80000000-0000-4000-8000-000000000003', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000003', 'call', 'Discovery follow-up', 'Confirm integration scope and decision committee.', '2026-07-25 13:00:00+00', null),
  ('80000000-0000-4000-8000-000000000004', 'd0000000-0000-4000-8000-000000000001', 'e0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000005', 'meeting', 'Commerce rollout kickoff', 'Completed kickoff and confirmed success metrics.', '2026-07-17 09:00:00+00', '2026-07-17 10:00:00+00')
on conflict (id) do nothing;
