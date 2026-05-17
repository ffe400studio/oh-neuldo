create table resolutions (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

create table topics (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  color text not null,
  color_light text not null,
  start_date text not null,
  end_date text not null,
  subtasks jsonb default '[]',
  created_at timestamptz default now()
);

create table posts (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  topic_id text not null,
  title text not null,
  content text,
  links jsonb default '[]',
  created_at timestamptz default now()
);

create table diaries (
  id text primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  date text not null,
  content text,
  image text,
  created_at timestamptz default now()
);

create table user_settings (
  user_id uuid references auth.users(id) on delete cascade primary key,
  active_resolution_id text,
  today_picks jsonb default '{}',
  last_visit_date text,
  updated_at timestamptz default now()
);

alter table resolutions enable row level security;
alter table topics enable row level security;
alter table posts enable row level security;
alter table diaries enable row level security;
alter table user_settings enable row level security;

create policy "own" on resolutions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on topics for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on posts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on diaries for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
