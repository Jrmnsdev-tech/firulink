-- FIRULINK SCHEMA + RLS
create extension if not exists "uuid-ossp";

-- USUARIOS (perfil extendido de auth.users)
create table if not exists usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nombre text not null,
  pais text not null,
  created_at timestamptz default now()
);

alter table usuarios enable row level security;

create policy "usuarios_select_own" on usuarios
  for select using (auth.uid() = id);
create policy "usuarios_insert_own" on usuarios
  for insert with check (auth.uid() = id);
create policy "usuarios_update_own" on usuarios
  for update using (auth.uid() = id);

-- Permite lectura pública del país (necesario para filtrar comunidad por país)
create policy "usuarios_select_public_pais" on usuarios
  for select using (true);

-- MASCOTAS
create table if not exists mascotas (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references usuarios(id) on delete cascade not null,
  nombre text not null,
  tipo text not null,
  raza text,
  color text,
  vacunas text,
  descripcion text,
  foto_url text,
  qr_code_url text,
  is_lost boolean default false,
  recompensa numeric,
  created_at timestamptz default now()
);

alter table mascotas enable row level security;

-- Lectura pública total (perfil /pet/[id] es público, y comunidad necesita ver mascotas de otros)
create policy "mascotas_select_public" on mascotas
  for select using (true);

create policy "mascotas_insert_own" on mascotas
  for insert with check (auth.uid() = owner_id);

create policy "mascotas_update_own" on mascotas
  for update using (auth.uid() = owner_id);

create policy "mascotas_delete_own" on mascotas
  for delete using (auth.uid() = owner_id);

-- AVISTAMIENTOS
create table if not exists avistamientos (
  id uuid primary key default uuid_generate_v4(),
  mascota_id uuid references mascotas(id) on delete cascade not null,
  comentario text not null,
  reportante_nombre text,
  reportante_contacto text,
  ubicacion text,
  created_at timestamptz default now()
);

alter table avistamientos enable row level security;

-- Cualquiera puede reportar un avistamiento (formulario público en /pet/[id])
create policy "avistamientos_insert_public" on avistamientos
  for insert with check (true);

-- Solo el dueño de la mascota puede ver los avistamientos de su mascota
create policy "avistamientos_select_owner" on avistamientos
  for select using (
    exists (
      select 1 from mascotas m
      where m.id = avistamientos.mascota_id
      and m.owner_id = auth.uid()
    )
  );

-- STORAGE: crear bucket 'fotos' público desde el dashboard de Supabase (Storage > New bucket > public)
