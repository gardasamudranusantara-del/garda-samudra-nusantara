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

alter table public.buyer_profiles enable row level security;
alter table public.suppliers enable row level security;
alter table public.business_documents enable row level security;
