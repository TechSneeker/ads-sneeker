-- Conversas por usuário
create table if not exists chats (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  platform    text default 'geral',
  operation_id uuid references operations(id) on delete set null,
  messages    jsonb not null default '[]',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

alter table chats enable row level security;

create policy "users see own chats"
  on chats for select using (auth.uid() = user_id);

create policy "users insert own chats"
  on chats for insert with check (auth.uid() = user_id);

create policy "users update own chats"
  on chats for update using (auth.uid() = user_id);

create policy "users delete own chats"
  on chats for delete using (auth.uid() = user_id);

create index idx_chats_user_id on chats(user_id);
create index idx_chats_updated_at on chats(updated_at desc);
