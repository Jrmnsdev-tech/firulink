'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { Heart, X, MapPin, ArrowLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Mascota } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'

export default function Comunidad() {
  const router = useRouter()
  const { usuario, loading } = useUser()
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [index, setIndex] = useState(0)
  const [modalMascota, setModalMascota] = useState<Mascota | null>(null)
  const [comentario, setComentario] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (!loading && !usuario) router.push('/')
  }, [loading, usuario])

  useEffect(() => {
    if (usuario) cargar()
  }, [usuario])

  const cargar = async () => {
    const { data } = await supabase.from('mascotas').select('*, usuarios!inner(pais)').eq('is_lost', true).eq('usuarios.pais', usuario!.pais)
    setMascotas((data as any) || [])
  }

  const handleDragEnd = (_e: any, info: PanInfo, m: Mascota) => {
    if (info.offset.x > 120) {
      setModalMascota(m)
      setIndex(i => i + 1)
    } else if (info.offset.x < -120) {
      setIndex(i => i + 1)
    }
  }

  const enviarAvistamiento = async () => {
    if (!modalMascota) return
    setEnviando(true)
    await supabase.from('avistamientos').insert({ mascota_id: modalMascota.id, comentario })
    setEnviando(false); setEnviado(true)
    setTimeout(() => { setModalMascota(null); setComentario(''); setEnviado(false) }, 1500)
  }

  if (loading || !usuario) return <div className="min-h-screen flex items-center justify-center text-navy">Cargando...</div>

  const actual = mascotas[index]

  return (
    <main className="min-h-screen max-w-md mx-auto px-6 py-10 flex flex-col items-center">
      <header className="w-full flex items-center gap-2 mb-6">
        <a href="/dashboard"><ArrowLeft className="text-navy" /></a>
        <h1 className="text-xl font-bold text-navy">Comunidad · {usuario.pais}</h1>
      </header>

      <div className="relative w-full h-[480px] flex items-center justify-center">
        <AnimatePresence>
          {actual ? (
            <motion.div
              key={actual.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => handleDragEnd(e, info, actual)}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute w-full glass rounded-3xl p-6 cursor-grab active:cursor-grabbing ring-2 ring-red-400"
            >
              <div className="text-center text-red-600 font-bold text-sm mb-2">🚨 ¡SE BUSCA!</div>
              {actual.foto_url && <img src={actual.foto_url} className="w-full h-52 object-cover rounded-2xl mb-4" />}
              <h2 className="text-2xl font-bold text-navy">{actual.nombre}</h2>
              <p className="text-navy/60 mb-2">{actual.tipo} · {actual.raza} · {actual.color}</p>
              <p className="text-navy/70 text-sm mb-3">{actual.descripcion}</p>
              {actual.recompensa && <p className="text-gold-dark font-bold">💰 Recompensa: ${actual.recompensa}</p>}
              <div className="flex justify-center gap-6 mt-6">
                <button onClick={() => setIndex(i => i + 1)} className="w-14 h-14 rounded-full bg-white shadow flex items-center justify-center text-red-500"><X /></button>
                <button onClick={() => setModalMascota(actual)} className="w-14 h-14 rounded-full btn-gold shadow flex items-center justify-center"><Heart /></button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center text-navy/50">
              <MapPin className="mx-auto mb-2" />
              No hay mascotas perdidas reportadas en {usuario.pais} por ahora.
            </div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {modalMascota && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy/60 flex items-center justify-center z-50 px-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-3xl p-6 w-full max-w-sm">
              {!enviado ? (
                <>
                  <h3 className="text-lg font-bold text-navy mb-2">¿Viste a {modalMascota.nombre}?</h3>
                  <textarea placeholder="Cuéntanos dónde y cuándo la viste..." value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10 w-full mb-4" rows={3} />
                  <div className="flex gap-2">
                    <button onClick={() => setModalMascota(null)} className="flex-1 rounded-xl py-3 border border-navy/20 text-navy">Cancelar</button>
                    <button disabled={enviando || !comentario} onClick={enviarAvistamiento} className="flex-1 btn-gold rounded-xl py-3">
                      {enviando ? 'Enviando...' : 'Reportar'}
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-center text-navy font-bold py-6">¡Gracias! El dueño fue notificado 🐾</p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
