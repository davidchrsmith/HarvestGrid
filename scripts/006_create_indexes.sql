-- Create indexes for better query performance

-- Profiles indexes
create index if not exists idx_profiles_user_type on public.profiles(user_type);

-- Organizations indexes
create index if not exists idx_organizations_type on public.organizations(type);
create index if not exists idx_organizations_created_by on public.organizations(created_by);
create index if not exists idx_organizations_location on public.organizations(latitude, longitude);

-- Organization members indexes
create index if not exists idx_organization_members_org_id on public.organization_members(organization_id);
create index if not exists idx_organization_members_user_id on public.organization_members(user_id);

-- Products indexes
create index if not exists idx_products_organization_id on public.products(organization_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_available on public.products(available);
create index if not exists idx_products_location on public.products(latitude, longitude);

-- Messages indexes
create index if not exists idx_messages_from_org on public.messages(from_organization_id);
create index if not exists idx_messages_to_org on public.messages(to_organization_id);
create index if not exists idx_messages_product_id on public.messages(product_id);
create index if not exists idx_messages_read on public.messages(read);
