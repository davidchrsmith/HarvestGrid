-- Create organizations table (farms and restaurants)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('farm', 'restaurant')),
  description text,
  location text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.organizations enable row level security;

-- Removed policy that references organization_members (moved to script 007)
-- RLS Policies for organizations
-- Anyone authenticated can view organizations
create policy "Authenticated users can view organizations"
  on public.organizations for select
  using (auth.uid() is not null);

-- Users can create organizations
create policy "Authenticated users can create organizations"
  on public.organizations for insert
  with check (auth.uid() is not null and auth.uid() = created_by);
