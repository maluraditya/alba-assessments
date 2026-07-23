create or replace function public.search_workspace(search_query text)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
  with matches as (
    select id, 'company'::text as entity_type, name as title, coalesce(domain, industry, '') as subtitle, '/companies'::text as href, updated_at
    from public.companies
    where owner_id = auth.uid() and (name ilike '%' || search_query || '%' or coalesce(domain, '') ilike '%' || search_query || '%')
    union all
    select id, 'contact', first_name || ' ' || last_name, email, '/contacts', updated_at
    from public.contacts
    where owner_id = auth.uid() and (first_name ilike '%' || search_query || '%' or last_name ilike '%' || search_query || '%' or email ilike '%' || search_query || '%')
    union all
    select id, 'deal', name, source, '/deals', updated_at
    from public.deals
    where owner_id = auth.uid() and (name ilike '%' || search_query || '%' or source ilike '%' || search_query || '%')
  )
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'type', entity_type, 'title', title, 'subtitle', subtitle, 'href', href) order by updated_at desc), '[]'::jsonb)
  from (select * from matches order by updated_at desc limit 12) limited;
$$;

revoke all on function public.search_workspace(text) from public;
revoke all on function public.search_workspace(text) from anon;
grant execute on function public.search_workspace(text) to authenticated;
