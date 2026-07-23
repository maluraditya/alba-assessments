-- Assessment-only second workspace used to prove cross-account isolation.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  'd0000000-0000-4000-8000-000000000002',
  'authenticated', 'authenticated', 'sam@pipelineos.demo',
  crypt('PipelineOS-demo-2026!', gen_salt('bf')), now(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sam Rivera"}', now(), now(), '', '', '', ''
)
on conflict (id) do nothing;

insert into public.companies (
  id, owner_id, name, domain, industry, size, location, annual_revenue
)
values (
  'c0000000-0000-4000-8000-000000000099',
  'd0000000-0000-4000-8000-000000000002',
  'Isolation Test Labs',
  'isolation-test.example',
  'Security Testing',
  '1–10',
  'Private workspace',
  100000
)
on conflict (id) do nothing;
