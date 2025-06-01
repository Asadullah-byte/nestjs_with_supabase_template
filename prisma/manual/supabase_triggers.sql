create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public."user" ("id", "email", "metadata")
  values (new.id::uuid, new.email, new.raw_user_meta_data);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
begin
  update public."user"
  set metadata = new.raw_user_meta_data
  where id = new.id::uuid;
  return new;
end;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_updated
AFTER UPDATE ON auth.users
FOR EACH ROW
EXECUTE PROCEDURE public.handle_user_update();