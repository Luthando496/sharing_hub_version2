-- Blog feature migration. Run AFTER supabase/schema.sql.
-- Paste into: Supabase dashboard -> SQL Editor -> New query -> Run.
-- Safe to run more than once.

-- ---------------------------------------------------------------------------
-- Roles. Everyone starts as 'student'. 'author' (SRC members, class reps...)
-- can write blog posts. 'admin' can also edit or delete anyone's posts.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'student';

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('student', 'author', 'admin'));

create or replace function public.is_author()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role in ('author', 'admin')
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
     where id = auth.uid() and role = 'admin'
  );
$$;

-- Nobody can promote themselves. Only an admin can change a role.
-- (Running SQL in the dashboard has no signed-in user, so that is always allowed.)
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and auth.uid() is not null
     and not public.is_admin() then
    raise exception 'Only an admin can change roles';
  end if;
  return new;
end $$;

drop trigger if exists profiles_protect_role on public.profiles;
create trigger profiles_protect_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- ---------------------------------------------------------------------------
-- Posts: subtitle, required cover image, published date
-- ---------------------------------------------------------------------------
alter table public.posts add column if not exists subtitle text not null default '';

alter table public.posts drop constraint if exists posts_cover_required;
alter table public.posts
  add constraint posts_cover_required
  check (cover_image_url is not null and cover_image_url <> '');

-- The first time a post is published, stamp the date.
create or replace function public.set_post_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.published and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end $$;

drop trigger if exists posts_set_published_at on public.posts;
create trigger posts_set_published_at
  before insert or update on public.posts
  for each row execute function public.set_post_published_at();

-- (posts.updated_at is already kept fresh by the trigger from schema.sql)

-- ---------------------------------------------------------------------------
-- Row level security: only authors/admins write; everyone reads published posts
-- ---------------------------------------------------------------------------
drop policy if exists "published posts are public" on public.posts;
drop policy if exists "users insert own posts"     on public.posts;
drop policy if exists "users update own posts"     on public.posts;
drop policy if exists "users delete own posts"     on public.posts;
drop policy if exists "posts readable"             on public.posts;
drop policy if exists "authors insert posts"       on public.posts;
drop policy if exists "authors update posts"       on public.posts;
drop policy if exists "authors delete posts"       on public.posts;

create policy "posts readable" on public.posts for select
  using (published or auth.uid() = author_id or public.is_admin());

create policy "authors insert posts" on public.posts for insert
  with check (auth.uid() = author_id and public.is_author());

create policy "authors update posts" on public.posts for update
  using      (public.is_admin() or (auth.uid() = author_id and public.is_author()))
  with check (public.is_admin() or (auth.uid() = author_id and public.is_author()));

create policy "authors delete posts" on public.posts for delete
  using (public.is_admin() or (auth.uid() = author_id and public.is_author()));

-- ---------------------------------------------------------------------------
-- HOW TO MAKE SOMEONE AN AUTHOR (run in the SQL Editor, change the email):
--
--   update public.profiles
--      set role = 'author'
--    where id = (select id from auth.users where email = 'src.member@school.edu');
--
-- Use 'admin' instead of 'author' for yourself, and 'student' to take it away.
-- ---------------------------------------------------------------------------
