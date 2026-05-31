create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text,
  company_name text,
  email text,
  whatsapp text,
  country text,
  city text,
  division text,
  products jsonb not null default '[]'::jsonb,
  quantity text,
  monthly_requirement text,
  packaging_request text,
  product_specification text,
  target_price text,
  message text,
  lead_priority text not null default 'Low',
  lead_score integer not null default 0,
  lead_reason text,
  status text not null default 'New',
  source text not null default 'inquiry_form',
  internal_notes text,
  follow_up_at timestamptz
);

create table if not exists public.tracking_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event text not null,
  label text,
  path text,
  source text not null default 'website',
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.investor_inquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text,
  company_name text,
  email text,
  country text,
  investment_interest text,
  message text,
  status text not null default 'New',
  internal_notes text
);

create table if not exists public.quotation_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  inquiry_id uuid,
  buyer_name text,
  company_name text,
  email text,
  whatsapp text,
  country text,
  products jsonb not null default '[]'::jsonb,
  quantity text,
  incoterm text,
  unit_price text,
  validity text,
  request_summary text,
  product_details text,
  internal_notes text,
  status text not null default 'Draft'
);

create table if not exists public.quotation_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  quotation_id uuid,
  inquiry_id uuid,
  buyer_name text,
  company_name text,
  document_title text,
  document_html text,
  document_text text,
  status text not null default 'Generated'
);

create table if not exists public.admin_notifications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  type text not null,
  title text not null,
  message text,
  reference_type text,
  reference_id uuid,
  is_read boolean not null default false
);

create table if not exists public.admin_settings (
  id text primary key default 'gsn-default',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  company_name text,
  contact_email text,
  whatsapp_number text,
  website_url text,
  office_location text,
  notification_preferences jsonb not null default '{}'::jsonb,
  analytics_settings jsonb not null default '{}'::jsonb,
  integration_settings jsonb not null default '{}'::jsonb
);

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_priority_idx on public.inquiries (lead_priority);
create index if not exists tracking_events_created_at_idx on public.tracking_events (created_at desc);
create index if not exists tracking_events_event_idx on public.tracking_events (event);
create index if not exists investor_inquiries_created_at_idx on public.investor_inquiries (created_at desc);
create index if not exists investor_inquiries_status_idx on public.investor_inquiries (status);
create index if not exists quotation_requests_created_at_idx on public.quotation_requests (created_at desc);
create index if not exists quotation_requests_status_idx on public.quotation_requests (status);
create index if not exists quotation_documents_created_at_idx on public.quotation_documents (created_at desc);
create index if not exists quotation_documents_quotation_id_idx on public.quotation_documents (quotation_id);
create index if not exists admin_notifications_created_at_idx on public.admin_notifications (created_at desc);
create index if not exists admin_notifications_is_read_idx on public.admin_notifications (is_read);
create index if not exists admin_settings_updated_at_idx on public.admin_settings (updated_at desc);

alter table public.inquiries enable row level security;
alter table public.tracking_events enable row level security;
alter table public.investor_inquiries enable row level security;
alter table public.quotation_requests enable row level security;
alter table public.quotation_documents enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_settings enable row level security;
