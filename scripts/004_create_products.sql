-- Create products table (farm inventory postings)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  category text not null check (category in ('produce', 'meat', 'dairy', 'other')),
  price decimal(10, 2) not null,
  quantity decimal(10, 2) not null,
  unit text not null,
  image_url text,
  location text,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  available boolean default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.products enable row level security;

-- RLS Policies for products
-- Anyone authenticated can view available products
create policy "Authenticated users can view available products"
  on public.products for select
  using (auth.uid() is not null and available = true);

-- Organization members can view all their products (including unavailable)
create policy "Organization members can view their products"
  on public.products for select
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = products.organization_id
      and organization_members.user_id = auth.uid()
    )
  );

-- Organization members can create products
create policy "Organization members can create products"
  on public.products for insert
  with check (
    auth.uid() = created_by and
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = products.organization_id
      and organization_members.user_id = auth.uid()
    )
  );

-- Organization members can update their products
create policy "Organization members can update their products"
  on public.products for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = products.organization_id
      and organization_members.user_id = auth.uid()
    )
  );

-- Organization members can delete their products
create policy "Organization members can delete their products"
  on public.products for delete
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = products.organization_id
      and organization_members.user_id = auth.uid()
    )
  );
