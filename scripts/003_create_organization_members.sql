-- Create organization_members table (many-to-many relationship)
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member')),
  joined_at timestamp with time zone default now(),
  unique(organization_id, user_id)
);

-- Enable RLS
alter table public.organization_members enable row level security;

-- RLS Policies for organization_members
-- Users can view memberships of organizations they belong to
create policy "Users can view their organization memberships"
  on public.organization_members for select
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
    )
  );

-- Users can insert themselves into organizations
create policy "Users can join organizations"
  on public.organization_members for insert
  with check (user_id = auth.uid());

-- Organization owners/admins can update memberships
create policy "Organization admins can update memberships"
  on public.organization_members for update
  using (
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
    )
  );

-- Users can remove themselves, or admins can remove others
create policy "Users can leave or be removed from organizations"
  on public.organization_members for delete
  using (
    user_id = auth.uid() or
    exists (
      select 1 from public.organization_members om
      where om.organization_id = organization_members.organization_id
      and om.user_id = auth.uid()
      and om.role in ('owner', 'admin')
    )
  );
