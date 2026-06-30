create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'viewer' check (role in ('viewer', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  slug text unique not null,
  excerpt text,
  category text not null check (category in ('Pitching', 'Hitting', 'Biomechanics', 'Training', 'Technology', 'Case Studies')),
  tags text[] not null default '{}',
  author_name text not null default 'TJ Galenti',
  hero_image_url text,
  hero_image_alt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  read_time_minutes integer not null default 1,
  seo_title text,
  seo_description text,
  content_blocks jsonb not null default '[]'::jsonb,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  path text not null,
  alt text,
  caption text,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at
before update on public.articles
for each row execute function public.touch_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'viewer')
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.media enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.profiles to authenticated;
grant select on public.articles to anon, authenticated;
grant insert, update, delete on public.articles to authenticated;
grant select on public.media to anon, authenticated;
grant insert, update, delete on public.media to authenticated;

drop policy if exists "Profiles can read their own profile" on public.profiles;
create policy "Profiles can read their own profile"
on public.profiles for select
using ((select auth.uid()) = id);

drop policy if exists "Public can read published articles" on public.articles;
create policy "Public can read published articles"
on public.articles for select
using (status = 'published');

drop policy if exists "Admins can read all articles" on public.articles;
create policy "Admins can read all articles"
on public.articles for select
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can insert articles" on public.articles;
create policy "Admins can insert articles"
on public.articles for insert
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update articles" on public.articles;
create policy "Admins can update articles"
on public.articles for update
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can delete articles" on public.articles;
create policy "Admins can delete articles"
on public.articles for delete
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "Public can read media records" on public.media;
create policy "Public can read media records"
on public.media for select
using (true);

drop policy if exists "Admins can manage media records" on public.media;
create policy "Admins can manage media records"
on public.media for all
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('article-media', 'article-media', true, 104857600, array['image/png', 'image/jpeg', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can read article media" on storage.objects;
create policy "Public can read article media"
on storage.objects for select
using (bucket_id = 'article-media');

drop policy if exists "Admins can upload article media" on storage.objects;
create policy "Admins can upload article media"
on storage.objects for insert
with check (
  bucket_id = 'article-media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can update article media" on storage.objects;
create policy "Admins can update article media"
on storage.objects for update
using (
  bucket_id = 'article-media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
)
with check (
  bucket_id = 'article-media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);

drop policy if exists "Admins can delete article media" on storage.objects;
create policy "Admins can delete article media"
on storage.objects for delete
using (
  bucket_id = 'article-media'
  and exists (
    select 1
    from public.profiles
    where profiles.id = (select auth.uid())
      and profiles.role = 'admin'
  )
);
