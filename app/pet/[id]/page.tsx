'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { PawPrint, AlertTriangle, Syringe, Palette } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Mascota } from '@/lib/supabase'

export default function PetPublicPage() {
  const { id } = useParams<{ id: string }>()
  const [mascota, setMascota] = useState<Mascota | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ comentario: '', reportante_nombre: '', reportante_contacto: '', ubicacion: '' })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('mascotas').select('*').eq('id', id).single()
      setMascota(data as Mascota)
      setLoading(false)
    }
    load()
  }, [id])

  const reportar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    await supabase.from('avistamientos').insert({ mascota_id: id, ...form })
    setEnviando(false)
    setEnviado(true)
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-navy">Cargando...</div>
  if (!mascota) return <div className="min-h-screen flex items-center justify-center text-navy">Mascota no encontrada.</div>

  if (mascota.is_lost) {
    return (
      <main className="min-h-screen bg-red-600 flex flex-col items-center px-6 py-10 text-white">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full text-center">
          <AlertTriangle size={56} className="mx-auto mb-3 animate-pulse" />
          <h1 className="text-3xl font-extrabold mb-1">¡SE BUSCA!</h1>
          <p className="mb-6 text-white/90">Ayúdanos a encontrar a {mascota.nombre}</p>

          {mascota.foto_url && <img src={mascota.foto_url} className="w-full h-56 object-cover rounded-2xl mb-4 border-4 border-white" />}

          <div className="bg-white text-navy rounded-2xl p-5 text-left mb-4">
            <h2 className="text-2xl font-bold">{mascota.nombre}</h2>
            <p className="text-navy/70 mb-2">{mascota.tipo} · {mascota.raza} · {mascota.color}</p>
            <p className="text-sm mb-2">{mascota.descripcion}</p>
            {mascota.recompensa && (
              <p className="font-bold text-lg text-red-600">💰 Recompensa: ${mascota.recompensa}</p>
            )}
          </div>

          {!enviado ? (
            <form onSubmit={reportar} className="bg-white rounded-2xl p-5 text-left flex flex-col gap-3">
              <h3 className="font-bold text-navy">Reporta un avistamiento</h3>
              <input required placeholder="Tu nombre" value={form.reportante_nombre}
                onChange={e => setForm({ ...form, reportante_nombre: e.target.value })}
                className="rounded-xl px-3 py-2 border border-navy/10 text-navy" />
              <input placeholder="Tu contacto (tel/email)" value={form.reportante_contacto}
                onChange={e => setForm({ ...form, reportante_contacto: e.target.value })}
                className="rounded-xl px-3 py-2 border border-navy/10 text-navy" />
              <input required placeholder="Lugar donde la viste" value={form.ubicacion}
                onChange={e => setForm({ ...form, ubicacion: e.target.value })}
                className="rounded-xl px-3 py-2 border border-navy/10 text-navy" />
              <textarea required placeholder="Detalles del avistamiento" value={form.comentario}
                onChange={e => setForm({ ...form, comentario: e.target.value })}
                className="rounded-xl px-3 py-2 border border-navy/10 text-navy" rows={3} />
              <button disabled={enviando} className="btn-gold rounded-xl py-3">{enviando ? 'Enviando...' : 'Enviar reporte'}</button>
            </form>
          ) : (
            <div className="bg-white text-navy rounded-2xl p-6 font-bold">¡Gracias! El dueño fue notificado 🐾</div>
          )}
        </motion.div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8 max-w-md w-full">
        <div className="flex items-center gap-2 mb-4 justify-center">
          <PawPrint className="text-gold" />
          <span className="text-navy/60 text-sm font-semibold">Carnet Digital FiruLink</span>
        </div>
        {mascota.foto_url && <img src={mascota.foto_url} className="w-full h-56 object-cover rounded-2xl mb-4" />}
        <h1 className="text-3xl font-bold text-navy text-center mb-1">{mascota.nombre}</h1>
        <p className="text-center text-navy/60 mb-6">{mascota.tipo} · {mascota.raza}</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="glass rounded-xl p-3 flex items-center gap-2"><Palette size={16} className="text-navy" /> {mascota.color || 'N/D'}</div>
          <div className="glass rounded-xl p-3 flex items-center gap-2"><Syringe size={16} className="text-navy" /> {mascota.vacunas || 'N/D'}</div>
        </div>
        {mascota.descripcion && <p className="text-navy/70 text-sm mt-4">{mascota.descripcion}</p>}
      </motion.div>
    </main>
  )
}
