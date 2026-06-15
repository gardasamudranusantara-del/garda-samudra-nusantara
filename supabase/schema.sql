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
  follow_up_at timestamptz,
  assigned_to text,
  follow_up_deadline timestamptz
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
  quotation_number text,
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
  quotation_number text,
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

create table if not exists public.admin_users (
  username text primary key,
  password text not null,
  role text not null default 'marketing',
  permissions jsonb not null default '[]'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

create table if not exists public.finance_transactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  transaction_type text not null,
  transaction_date date not null default current_date,
  category text,
  description text,
  amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  payment_method text,
  reference_number text,
  created_by text
);

create table if not exists public.bank_accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  account_name text not null,
  bank_name text,
  account_number text,
  currency text not null default 'IDR',
  current_balance numeric(18,2) not null default 0,
  status text not null default 'Active'
);

create table if not exists public.petty_cash (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  cash_date date not null default current_date,
  description text,
  amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  responsible_person text,
  status text not null default 'Recorded'
);

create table if not exists public.revenues (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invoice_number text,
  buyer_name text,
  country text,
  division text,
  category text,
  product text,
  quantity numeric(18,3) not null default 0,
  unit text,
  unit_price numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  total_revenue numeric(18,2) not null default 0,
  transaction_date date not null default current_date,
  status text not null default 'Recorded'
);

create table if not exists public.expense_categories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null unique,
  description text
);

create table if not exists public.expense_subcategories (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  category_id uuid references public.expense_categories(id) on delete cascade,
  name text not null,
  description text,
  unique(category_id, name)
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expense_date date not null default current_date,
  expense_category text,
  expense_subcategory text,
  vendor text,
  description text,
  amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  payment_method text,
  receipt_url text,
  status text not null default 'Draft',
  created_by text,
  approved_by text,
  approved_at timestamptz,
  approval_note text
);

create table if not exists public.receivables (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  invoice_number text,
  invoice_date date,
  quotation_id uuid,
  quotation_number text,
  buyer_name text,
  commodity text,
  amount numeric(18,2) not null default 0,
  paid_amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  due_date date,
  status text not null default 'Pending'
);

create table if not exists public.payables (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  supplier_name text,
  commodity text,
  invoice_number text,
  amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  due_date date,
  status text not null default 'Unpaid'
);

create table if not exists public.payment_matches (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  payment_date date not null default current_date,
  invoice_number text,
  buyer_name text,
  receivable_id uuid,
  cash_transaction_id uuid,
  amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  payment_method text,
  proof_url text,
  status text not null default 'Matched',
  notes text,
  created_by text
);

create table if not exists public.supplier_payments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  payment_date date not null default current_date,
  supplier_name text,
  supplier_account text,
  payable_id uuid,
  invoice_number text,
  amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  payment_method text,
  proof_url text,
  status text not null default 'Scheduled',
  notes text,
  created_by text
);

create table if not exists public.tax_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  tax_period text,
  tax_type text not null,
  reference_number text,
  taxable_amount numeric(18,2) not null default 0,
  tax_amount numeric(18,2) not null default 0,
  currency text not null default 'IDR',
  document_url text,
  due_date date,
  status text not null default 'Draft',
  notes text,
  created_by text
);

create table if not exists public.exchange_rates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  rate_date date not null default current_date,
  base_currency text not null default 'IDR',
  target_currency text not null,
  rate numeric(18,6) not null default 1,
  source text,
  notes text,
  created_by text,
  unique(rate_date, base_currency, target_currency)
);

create table if not exists public.budgets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  fiscal_year integer not null,
  budget_category text not null,
  planned_budget numeric(18,2) not null default 0,
  actual_spending numeric(18,2) not null default 0,
  remaining_budget numeric(18,2) not null default 0,
  currency text not null default 'IDR'
);

create table if not exists public.financial_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  report_type text not null,
  title text,
  date_from date,
  date_to date,
  filters jsonb not null default '{}'::jsonb,
  report_data jsonb not null default '{}'::jsonb,
  generated_by text
);

create table if not exists public.investor_reports (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  title text,
  reporting_period text,
  company_metrics jsonb not null default '{}'::jsonb,
  financial_metrics jsonb not null default '{}'::jsonb,
  fund_allocation jsonb not null default '{}'::jsonb,
  generated_by text,
  status text not null default 'Draft'
);

create table if not exists public.finance_roles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  role_name text not null unique,
  description text
);

create table if not exists public.finance_permissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text not null,
  permission_key text not null,
  granted_by text,
  unique(user_id, permission_key)
);

create table if not exists public.finance_access_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text,
  action text not null,
  module text,
  ip_address text,
  device text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.finance_invitations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  role text not null,
  invited_by text,
  status text not null default 'Pending',
  expires_at timestamptz
);

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

create table if not exists public.buyer_profiles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  buyer_name text,
  company_name text,
  email text,
  whatsapp text,
  country text,
  city text,
  preferred_division text,
  products jsonb not null default '[]'::jsonb,
  buyer_stage text not null default 'New',
  relationship_status text not null default 'Prospect',
  source text not null default 'admin',
  assigned_to text,
  last_inquiry_at timestamptz,
  last_quotation_at timestamptz,
  total_inquiries integer not null default 0,
  total_quotations integer not null default 0,
  notes text
);

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  supplier_name text,
  company_name text,
  contact_person text,
  email text,
  whatsapp text,
  country text not null default 'Indonesia',
  city text,
  product_categories jsonb not null default '[]'::jsonb,
  products jsonb not null default '[]'::jsonb,
  capacity text,
  payment_terms text,
  lead_time text,
  quality_rating integer not null default 0,
  status text not null default 'Active',
  notes text
);

create table if not exists public.business_documents (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  document_type text not null default 'General',
  title text not null,
  related_type text,
  related_name text,
  file_url text,
  status text not null default 'Active',
  expiry_date date,
  owner text,
  notes text,
  created_by text
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('finance-documents', 'finance-documents', true, 10485760)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit;

alter table public.quotation_requests add column if not exists quotation_number text;
alter table public.quotation_documents add column if not exists quotation_number text;
alter table public.inquiries add column if not exists assigned_to text;
alter table public.inquiries add column if not exists follow_up_deadline timestamptz;
alter table public.expenses add column if not exists approved_by text;
alter table public.expenses add column if not exists approved_at timestamptz;
alter table public.expenses add column if not exists approval_note text;
alter table public.receivables add column if not exists invoice_date date;
alter table public.receivables add column if not exists quotation_id uuid;
alter table public.receivables add column if not exists quotation_number text;
alter table public.receivables add column if not exists paid_amount numeric(18,2) not null default 0;
alter table public.finance_period_locks add column if not exists updated_at timestamptz not null default now();
alter table public.finance_period_locks add column if not exists lock_note text;

create index if not exists inquiries_created_at_idx on public.inquiries (created_at desc);
create index if not exists inquiries_status_idx on public.inquiries (status);
create index if not exists inquiries_priority_idx on public.inquiries (lead_priority);
create index if not exists inquiries_assigned_to_idx on public.inquiries (assigned_to);
create index if not exists inquiries_follow_up_deadline_idx on public.inquiries (follow_up_deadline);
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
create index if not exists admin_users_role_idx on public.admin_users (role);
alter table public.admin_users add column if not exists permissions jsonb not null default '[]'::jsonb;
create index if not exists attendance_records_date_idx on public.attendance_records (attendance_date desc);
create index if not exists attendance_records_username_idx on public.attendance_records (username);
create index if not exists attendance_records_status_idx on public.attendance_records (status);
create index if not exists finance_transactions_date_idx on public.finance_transactions (transaction_date desc);
create index if not exists finance_transactions_type_idx on public.finance_transactions (transaction_type);
create index if not exists revenues_date_idx on public.revenues (transaction_date desc);
create index if not exists revenues_division_idx on public.revenues (division);
create index if not exists revenues_country_idx on public.revenues (country);
create index if not exists expenses_date_idx on public.expenses (expense_date desc);
create index if not exists expenses_category_idx on public.expenses (expense_category);
create index if not exists receivables_due_date_idx on public.receivables (due_date);
create index if not exists receivables_status_idx on public.receivables (status);
create index if not exists payables_due_date_idx on public.payables (due_date);
create index if not exists payables_status_idx on public.payables (status);
create index if not exists payment_matches_invoice_idx on public.payment_matches (invoice_number);
create index if not exists payment_matches_date_idx on public.payment_matches (payment_date desc);
create index if not exists supplier_payments_invoice_idx on public.supplier_payments (invoice_number);
create index if not exists supplier_payments_date_idx on public.supplier_payments (payment_date desc);
create index if not exists tax_records_period_idx on public.tax_records (tax_period);
create index if not exists tax_records_status_idx on public.tax_records (status);
create index if not exists exchange_rates_date_idx on public.exchange_rates (rate_date desc);
create index if not exists budgets_year_idx on public.budgets (fiscal_year);
create index if not exists finance_permissions_user_idx on public.finance_permissions (user_id);
create index if not exists finance_access_logs_created_at_idx on public.finance_access_logs (created_at desc);
create index if not exists finance_invitations_status_idx on public.finance_invitations (status);
create index if not exists finance_period_locks_range_idx on public.finance_period_locks (date_from, date_to);
create index if not exists finance_period_locks_status_idx on public.finance_period_locks (status);
create index if not exists buyer_profiles_company_idx on public.buyer_profiles (company_name);
create index if not exists buyer_profiles_country_idx on public.buyer_profiles (country);
create index if not exists buyer_profiles_stage_idx on public.buyer_profiles (buyer_stage);
create index if not exists buyer_profiles_assigned_to_idx on public.buyer_profiles (assigned_to);
create index if not exists suppliers_company_idx on public.suppliers (company_name);
create index if not exists suppliers_status_idx on public.suppliers (status);
create index if not exists suppliers_country_idx on public.suppliers (country);
create index if not exists business_documents_type_idx on public.business_documents (document_type);
create index if not exists business_documents_status_idx on public.business_documents (status);
create index if not exists business_documents_expiry_idx on public.business_documents (expiry_date);

insert into public.finance_roles (role_name, description)
values
  ('CEO', 'Full finance ownership and confidential access control.'),
  ('Finance Manager', 'Finance management access without ownership transfer.'),
  ('Finance Staff', 'Create and edit assigned finance records.'),
  ('Investor', 'Read-only investor report access.')
on conflict (role_name) do update set description = excluded.description;

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

alter table public.inquiries enable row level security;
alter table public.tracking_events enable row level security;
alter table public.investor_inquiries enable row level security;
alter table public.quotation_requests enable row level security;
alter table public.quotation_documents enable row level security;
alter table public.admin_notifications enable row level security;
alter table public.admin_settings enable row level security;
alter table public.admin_users enable row level security;
alter table public.attendance_records enable row level security;
alter table public.finance_transactions enable row level security;
alter table public.bank_accounts enable row level security;
alter table public.petty_cash enable row level security;
alter table public.revenues enable row level security;
alter table public.expense_categories enable row level security;
alter table public.expense_subcategories enable row level security;
alter table public.expenses enable row level security;
alter table public.receivables enable row level security;
alter table public.payables enable row level security;
alter table public.payment_matches enable row level security;
alter table public.supplier_payments enable row level security;
alter table public.tax_records enable row level security;
alter table public.exchange_rates enable row level security;
alter table public.budgets enable row level security;
alter table public.financial_reports enable row level security;
alter table public.investor_reports enable row level security;
alter table public.finance_roles enable row level security;
alter table public.finance_permissions enable row level security;
alter table public.finance_access_logs enable row level security;
alter table public.finance_invitations enable row level security;
alter table public.finance_period_locks enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.business_documents enable row level security;

create index if not exists quotation_requests_number_idx on public.quotation_requests (quotation_number);
create index if not exists quotation_documents_number_idx on public.quotation_documents (quotation_number);
create index if not exists receivables_invoice_number_idx on public.receivables (invoice_number);
create index if not exists receivables_quotation_number_idx on public.receivables (quotation_number);

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
