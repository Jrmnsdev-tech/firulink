'use client'
import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { Usuario } from './supabase'

export function useUser() {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data } = await supabase.from('usuarios').select('*').eq('id', session.user.id).single()
        setUsuario(data as Usuario)
      }
      setLoading(false)
    }
    load()
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session?.user) {
        supabase.from('usuarios').select('*').eq('id', session.user.id).single().then(({ data }) => setUsuario(data as Usuario))
      } else {
        setUsuario(null)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return { usuario, loading }
}
