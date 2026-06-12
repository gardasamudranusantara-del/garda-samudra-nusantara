create table if not exists public.finance_period_locks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  period_label text not null,
  date_from date not null,
  date_to date not null,
  status text not null default 'Locked',
  locked_by text,
  lock_note text,
  unique(period_label)
);

alter table public.finance_period_locks add column if not exists updated_at timestamptz not null default now();
alter table public.finance_period_locks add column if not exists lock_note text;

create index if not exists finance_period_locks_range_idx on public.finance_period_locks (date_from, date_to);
create index if not exists finance_period_locks_status_idx on public.finance_period_locks (status);

alter table public.finance_period_locks enable row level security;

insert into storage.buckets (id, name, public, file_size_limit)
values ('finance-documents', 'finance-documents', true, 10485760)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;
