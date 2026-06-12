create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  attendance_date date not null default current_date,
  username text not null,
  role text,
  status text not null default 'Present',
  check_in_at timestamptz,
  check_out_at timestamptz,
  work_mode text not null default 'Office',
  location text,
  notes text,
  unique (attendance_date, username)
);

create index if not exists attendance_records_date_idx on public.attendance_records (attendance_date desc);
create index if not exists attendance_records_username_idx on public.attendance_records (username);
create index if not exists attendance_records_status_idx on public.attendance_records (status);

insert into public.admin_settings (
  id,
  company_name,
  contact_email,
  whatsapp_number,
  website_url,
  office_location,
  notification_preferences,
  analytics_settings,
  integration_settings
)
values (
  'gsn-default',
  'Garda Samudra Nusantara',
  'gardasamudranusantara@gmail.com',
  '',
  'https://www.gardasamudranusantara.com',
  'Indonesia',
  '{"email": true, "telegram": false, "whatsapp": false, "daily_report": true, "finance_reminder": true}'::jsonb,
  '{"track_cta_clicks": true, "track_nusabot": true, "track_partner_clicks": true}'::jsonb,
  '{"supabase": "connected", "resend": "connected", "telegram": "planned", "whatsapp_api": "planned"}'::jsonb
)
on conflict (id) do nothing;

alter table public.attendance_records enable row level security;
