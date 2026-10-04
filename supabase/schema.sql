-- ResourceHub schema for Supabase.
-- Paste this whole file into: Supabase dashboard -> SQL Editor -> New query -> Run.
-- It is safe to run more than once.

-- ---------------------------------------------------------------------------
-- profiles: one row per auth user (name, avatar, bio...). Email lives in auth.users.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  first_name  text not null default '',
  last_name   text not null default '',
  avatar_url  text,
  module      text not null default '',
  bio         text not null default '',
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- resources: uploaded study material. Files live on ImageKit; we store the URLs.
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id             uuid primary key default gen_random_uuid(),
  author_id      uuid not null references public.profiles (id) on delete cascade,
  title          text not null check (char_length(title) between 1 and 200),
  description    text not null default '',
  category       text not null default 'Uncategorized',
  type           text not null default 'Document',
  file_url       text not null,
  file_id        text,            -- ImageKit fileId (needed to delete the file later)
  file_name      text not null,
  file_size      bigint not null default 0,
  file_type      text not null default '',
  thumbnail_url  text,
  downloads      integer not null default 0 check (downloads >= 0),
  created_at     timestamptz not null default now()
);

create index if not exists resources_author_idx   on public.resources (author_id);
create index if not exists resources_category_idx on public.resources (category);
create index if not exists resources_created_idx  on public.resources (created_at desc);

-- ---------------------------------------------------------------------------
-- posts: blog posts (for the upcoming blog feature).
-- ---------------------------------------------------------------------------
create table if not exists public.posts (
  id               uuid primary key default gen_random_uuid(),
  author_id        uuid not null references public.profiles (id) on delete cascade,
  title            text not null,
  slug             text not null unique,
  excerpt          text not null default '',
  content          text not null default '',
  cover_image_url  text,
  published        boolean not null default false,
  published_at     timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists posts_author_idx    on public.posts (author_id);
create index if not exists posts_published_idx on public.posts (published, published_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists posts_set_updated_at on public.posts;
create trigger posts_set_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Create a profile automatically whenever someone signs up (email, Google, GitHub).
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  full_name text := coalesce(new.raw_user_meta_data ->> 'full_name',
                             new.raw_user_meta_data ->> 'name', '');
  space_at  int  := position(' ' in coalesce(new.raw_user_meta_data ->> 'full_name',
                             new.raw_user_meta_data ->> 'name', ''));
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    coalesce(
      nullif(new.raw_user_meta_data ->> 'first_name', ''),
      nullif(split_part(full_name, ' ', 1), ''),
      split_part(coalesce(new.email, ''), '@', 1)
    ),
    coalesce(
      new.raw_user_meta_data ->> 'last_name',
      case when space_at > 0 then substring(full_name from space_at + 1) else '' end
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url',
             new.raw_user_meta_data ->> 'picture')
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Download counter: anyone may bump a counter, but only through this function.
-- ---------------------------------------------------------------------------
create or replace function public.increment_download(p_resource_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.resources
     set downloads = downloads + 1
   where id = p_resource_id;
$$;

revoke all on function public.increment_download(uuid) from public;
grant execute on function public.increment_download(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles  enable row level security;
alter table public.resources enable row level security;
alter table public.posts     enable row level security;

-- profiles: public read, owner can edit their own row
drop policy if exists "profiles are public"        on public.profiles;
drop policy if exists "users update own profile"   on public.profiles;
create policy "profiles are public"      on public.profiles for select using (true);
create policy "users update own profile" on public.profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- resources: public read, signed-in users manage only their own
drop policy if exists "resources are public"       on public.resources;
drop policy if exists "users insert own resources" on public.resources;
drop policy if exists "users update own resources" on public.resources;
drop policy if exists "users delete own resources" on public.resources;
create policy "resources are public"       on public.resources for select using (true);
create policy "users insert own resources" on public.resources for insert
  with check (auth.uid() = author_id);
create policy "users update own resources" on public.resources for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users delete own resources" on public.resources for delete
  using (auth.uid() = author_id);

-- posts: published posts are public, drafts are visible only to their author
drop policy if exists "published posts are public" on public.posts;
drop policy if exists "users insert own posts"     on public.posts;
drop policy if exists "users update own posts"     on public.posts;
drop policy if exists "users delete own posts"     on public.posts;
create policy "published posts are public" on public.posts for select
  using (published or auth.uid() = author_id);
create policy "users insert own posts" on public.posts for insert
  with check (auth.uid() = author_id);
create policy "users update own posts" on public.posts for update
  using (auth.uid() = author_id) with check (auth.uid() = author_id);
create policy "users delete own posts" on public.posts for delete
  using (auth.uid() = author_id);
