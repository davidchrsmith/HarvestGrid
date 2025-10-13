-- Add policies that depend on multiple tables existing
-- This script must run AFTER organizations and organization_members are created

-- Organization members can update their organization
create policy "Organization members can update their organization"
  on public.organizations for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = organizations.id
      and organization_members.user_id = auth.uid()
    )
  );
