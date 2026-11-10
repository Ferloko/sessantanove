-- Esquema de Supabase para el modo Creador de Sessanta Nove (ya aplicado en el proyecto «sessanta-nove»).
-- Para autorizar a otra persona: insert into public.sn_admins (email) values ('correo@ejemplo.com');

create table public.sn_content (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);
create table public.sn_admins (email text primary key);

alter table public.sn_content enable row level security;
alter table public.sn_admins enable row level security; -- sin políticas: nadie la lee desde la API

-- Es administrador quien ha iniciado sesión con un correo confirmado que está en sn_admins.
create or replace function public.sn_is_admin()
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from auth.users u
    join public.sn_admins a on lower(a.email) = lower(u.email)
    where u.id = (select auth.uid()) and u.email_confirmed_at is not null
  );
$$;
revoke all on function public.sn_is_admin() from public, anon;
grant execute on function public.sn_is_admin() to authenticated;

create policy "Contenido visible para todos" on public.sn_content for select to anon, authenticated using (true);
create policy "Solo administradores crean contenido" on public.sn_content for insert to authenticated with check ((select public.sn_is_admin()));
create policy "Solo administradores editan contenido" on public.sn_content for update to authenticated
  using ((select public.sn_is_admin())) with check ((select public.sn_is_admin()));

-- Imágenes: lectura pública, escritura solo de administradores.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sn-images', 'sn-images', true, 6291456, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'])
on conflict (id) do nothing;
create policy "sn-images: administradores suben" on storage.objects for insert to authenticated with check (bucket_id = 'sn-images' and (select public.sn_is_admin()));
create policy "sn-images: administradores reemplazan" on storage.objects for update to authenticated using (bucket_id = 'sn-images' and (select public.sn_is_admin()));
create policy "sn-images: administradores borran" on storage.objects for delete to authenticated using (bucket_id = 'sn-images' and (select public.sn_is_admin()));
