do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  demo_tenant_id uuid := '11111111-1111-1111-1111-111111111111';
begin
  insert into auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  )
  values (
    demo_user_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner@lexia-demo.local',
    crypt('ChangeMe123!', gen_salt('bf')),
    timezone('utc', now()),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"LexIA Demo Owner"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now()),
    '',
    '',
    '',
    ''
  )
  on conflict (id) do update
    set email = excluded.email,
        raw_user_meta_data = excluded.raw_user_meta_data,
        updated_at = timezone('utc', now());

  insert into public.tenants (id, name, slug, plan)
  values (
    demo_tenant_id,
    'LexIA Bancaria Demo',
    'lexia-demo',
    'pro'
  )
  on conflict (id) do update
    set name = excluded.name,
        slug = excluded.slug,
        plan = excluded.plan,
        updated_at = timezone('utc', now());

  insert into public.profiles (id, full_name, email, is_active)
  values (
    demo_user_id,
    'LexIA Demo Owner',
    'owner@lexia-demo.local',
    true
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        email = excluded.email,
        is_active = excluded.is_active,
        updated_at = timezone('utc', now());

  insert into public.memberships (id, user_id, tenant_id, role, is_active)
  values (
    '22222222-2222-2222-2222-222222222222',
    demo_user_id,
    demo_tenant_id,
    'owner',
    true
  )
  on conflict (id) do update
    set user_id = excluded.user_id,
        tenant_id = excluded.tenant_id,
        role = excluded.role,
        is_active = excluded.is_active,
        updated_at = timezone('utc', now());
end
$$;
