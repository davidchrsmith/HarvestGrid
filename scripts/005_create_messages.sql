-- Create messages table (communication between organizations)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  from_organization_id uuid not null references public.organizations(id) on delete cascade,
  to_organization_id uuid not null references public.organizations(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  subject text not null,
  message text not null,
  sender_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  read boolean default false
);

-- Enable RLS
alter table public.messages enable row level security;

-- RLS Policies for messages
-- Users can view messages for organizations they belong to
create policy "Organization members can view their messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.organization_members
      where (
        organization_members.organization_id = messages.from_organization_id or
        organization_members.organization_id = messages.to_organization_id
      )
      and organization_members.user_id = auth.uid()
    )
  );

-- Users can send messages from organizations they belong to
create policy "Organization members can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id and
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = messages.from_organization_id
      and organization_members.user_id = auth.uid()
    )
  );

-- Users can mark messages as read for their organizations
create policy "Organization members can update message read status"
  on public.messages for update
  using (
    exists (
      select 1 from public.organization_members
      where organization_members.organization_id = messages.to_organization_id
      and organization_members.user_id = auth.uid()
    )
  );
