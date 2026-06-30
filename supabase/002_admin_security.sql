-- Run after 001_initial_schema.sql
-- Optional hardening: block promoting additional users to admin.
-- The partial unique index is the race-safe enforcement. The trigger keeps
-- the dashboard/SQL error readable when someone tries to add a second admin.

create unique index if not exists profiles_single_admin_idx
on public.profiles (role)
where role = 'admin';

create or replace function public.prevent_extra_admins()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_count integer;
begin
  if new.role = 'admin' and (tg_op = 'INSERT' or old.role is distinct from new.role) then
    select count(*) into admin_count
    from public.profiles
    where role = 'admin'
      and id <> new.id;

    if admin_count > 0 then
      raise exception 'Only one admin account is allowed.';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_extra_admins() from public;

drop trigger if exists profiles_prevent_extra_admins on public.profiles;
create trigger profiles_prevent_extra_admins
before insert or update on public.profiles
for each row execute function public.prevent_extra_admins();
