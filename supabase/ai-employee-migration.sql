create table if not exists public.ai_audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  admin_username text,
  user_role text,
  tool_name text,
  input_params jsonb default '{}'::jsonb,
  output_result jsonb,
  status text check (status in ('proposed','confirmed','executed','cancelled','denied')),
  created_at timestamptz default now()
);

create index if not exists ai_audit_log_created_at_idx on public.ai_audit_log (created_at desc);
create index if not exists ai_audit_log_admin_idx on public.ai_audit_log (admin_username);
create index if not exists ai_audit_log_tool_idx on public.ai_audit_log (tool_name);

alter table public.ai_audit_log enable row level security;

drop policy if exists "users see own ai audit log" on public.ai_audit_log;
create policy "users see own ai audit log"
  on public.ai_audit_log for select
  using (auth.uid() = user_id);

drop policy if exists "admins see all ai audit log" on public.ai_audit_log;
create policy "admins see all ai audit log"
  on public.ai_audit_log for select
  using (
    exists (
      select 1 from public.admin_users
      where admin_users.username = public.ai_audit_log.admin_username
      and admin_users.role in ('ceo', 'cso', 'owner')
    )
  );
