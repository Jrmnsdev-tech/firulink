import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(url, key)

export type Mascota = {
  id: string
  owner_id: string
  nombre: string
  tipo: string
  raza: string
  color: string
  vacunas: string
  descripcion: string
  foto_url: string
  qr_code_url: string
  is_lost: boolean
  recompensa: number | null
  created_at?: string
}

export type Usuario = {
  id: string
  email: string
  nombre: string
  pais: string
}
