create table if not exists public.admin_users (
  username text primary key,
  password text not null,
  role text not null default 'marketing',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_users_role_idx on public.admin_users (role);
create index if not exists admin_users_active_idx on public.admin_users (is_active);

alter table public.admin_users enable row level security;
