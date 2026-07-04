'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { QRCodeCanvas } from 'qrcode.react'
import { motion } from 'framer-motion'
import { PawPrint, LogOut, Download, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { Mascota } from '@/lib/supabase'
import { useUser } from '@/lib/useUser'
import { generarCarnetPDF } from '@/lib/generarCarnetPDF'

export default function Dashboard() {
  const router = useRouter()
  const { usuario, loading } = useUser()
  const [mascotas, setMascotas] = useState<Mascota[]>([])
  const [form, setForm] = useState({ nombre: '', tipo: 'Perro', raza: '', color: '', vacunas: '', descripcion: '', recompensa: '' })
  const [foto, setFoto] = useState<File | null>(null)
  const [isLost, setIsLost] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const qrRefs = useRef<Record<string, HTMLCanvasElement | null>>({})

  useEffect(() => {
    if (!loading && !usuario) router.push('/')
  }, [loading, usuario])

  useEffect(() => {
    if (usuario) cargarMascotas()
  }, [usuario])

  const cargarMascotas = async () => {
    const { data } = await supabase.from('mascotas').select('*').eq('owner_id', usuario!.id).order('created_at', { ascending: false })
    setMascotas((data as Mascota[]) || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!usuario) return
    setGuardando(true)
    let foto_url = ''
    if (foto) {
      const path = `${usuario.id}/${Date.now()}-${foto.name}`
      const { data } = await supabase.storage.from('fotos').upload(path, foto)
      if (data) {
        const { data: pub } = supabase.storage.from('fotos').getPublicUrl(data.path)
        foto_url = pub.publicUrl
      }
    }
    const { error } = await supabase.from('mascotas').insert({
      owner_id: usuario.id,
      nombre: form.nombre,
      tipo: form.tipo,
      raza: form.raza,
      color: form.color,
      vacunas: form.vacunas,
      descripcion: form.descripcion,
      foto_url,
      is_lost: isLost,
      recompensa: form.recompensa ? Number(form.recompensa) : null,
    })
    setGuardando(false)
    if (!error) {
      setForm({ nombre: '', tipo: 'Perro', raza: '', color: '', vacunas: '', descripcion: '', recompensa: '' })
      setFoto(null); setIsLost(false)
      cargarMascotas()
    }
  }

  const toggleLost = async (m: Mascota) => {
    const nuevoEstado = !m.is_lost
    await supabase.from('mascotas').update({ is_lost: nuevoEstado }).eq('id', m.id)
    cargarMascotas()
  }

  const actualizarRecompensa = async (m: Mascota, valor: string) => {
    await supabase.from('mascotas').update({ recompensa: valor ? Number(valor) : null }).eq('id', m.id)
    cargarMascotas()
  }

  const descargarPDF = async (m: Mascota) => {
    const canvas = qrRefs.current[m.id]
    if (!canvas) return
    const qrDataUrl = canvas.toDataURL('image/png')
    await generarCarnetPDF(m, qrDataUrl)
  }

  const logout = async () => { await supabase.auth.signOut(); router.push('/') }

  if (loading || !usuario) return <div className="min-h-screen flex items-center justify-center text-navy">Cargando...</div>

  return (
    <main className="min-h-screen max-w-5xl mx-auto px-6 py-10">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <PawPrint className="text-gold" size={28} />
          <h1 className="text-2xl font-bold text-navy">Hola, {usuario.nombre} 👋</h1>
        </div>
        <div className="flex gap-3">
          <a href="/comunidad" className="btn-navy rounded-xl px-4 py-2 text-sm">Comunidad</a>
          <button onClick={logout} className="flex items-center gap-1 text-navy/70 text-sm"><LogOut size={16} /> Salir</button>
        </div>
      </header>

      <section className="glass rounded-3xl p-6 mb-10">
        <h2 className="text-xl font-bold text-navy mb-4">Registrar nueva mascota</h2>
        <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
          <input required placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
          <select value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10">
            <option>Perro</option><option>Gato</option><option>Ave</option><option>Otro</option>
          </select>
          <input placeholder="Raza" value={form.raza} onChange={e => setForm({ ...form, raza: e.target.value })}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
          <input placeholder="Color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
          <input placeholder="Vacunas" value={form.vacunas} onChange={e => setForm({ ...form, vacunas: e.target.value })}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
          <input type="file" accept="image/*" onChange={e => setFoto(e.target.files?.[0] || null)}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
          <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })}
            className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10 md:col-span-2" rows={2} />

          <div className="flex items-center gap-3 md:col-span-2 glass rounded-xl p-4">
            <button type="button" onClick={() => setIsLost(!isLost)}
              className={`w-14 h-7 rounded-full relative transition ${isLost ? 'bg-red-500' : 'bg-navy/20'}`}>
              <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition ${isLost ? 'translate-x-7' : ''}`} />
            </button>
            <span className={`font-bold ${isLost ? 'text-red-600' : 'text-navy/60'}`}>{isLost ? '¡SE BUSCA! activado' : 'Activar modo ¡SE BUSCA!'}</span>
            {isLost && (
              <input type="number" placeholder="Recompensa $" value={form.recompensa}
                onChange={e => setForm({ ...form, recompensa: e.target.value })}
                className="rounded-xl px-3 py-2 bg-white border border-red-200 ml-auto w-40" />
            )}
          </div>

          <button disabled={guardando} className="btn-gold rounded-xl py-3 md:col-span-2">
            {guardando ? 'Guardando...' : 'Registrar mascota'}
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-xl font-bold text-navy mb-4">Mis mascotas</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {mascotas.map(m => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`glass rounded-2xl p-5 ${m.is_lost ? 'ring-2 ring-red-500' : ''}`}>
              {m.is_lost && (
                <div className="flex items-center gap-1 text-red-600 text-xs font-bold mb-2">
                  <AlertTriangle size={14} /> ¡SE BUSCA!
                </div>
              )}
              {m.foto_url && <img src={m.foto_url} className="w-full h-32 object-cover rounded-xl mb-3" />}
              <h3 className="font-bold text-navy">{m.nombre}</h3>
              <p className="text-navy/60 text-sm mb-3">{m.tipo} · {m.raza || 'N/D'}</p>

              <div className="hidden">
                <QRCodeCanvas
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/pet/${m.id}`}
                  size={200}
                  ref={(el) => { qrRefs.current[m.id] = el }}
                />
              </div>

              <div className="flex items-center justify-between mb-3">
                <label className="text-xs text-navy/70">Modo SE BUSCA</label>
                <button onClick={() => toggleLost(m)}
                  className={`w-11 h-6 rounded-full relative transition ${m.is_lost ? 'bg-red-500' : 'bg-navy/20'}`}>
                  <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition ${m.is_lost ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              {m.is_lost && (
                <input type="number" placeholder="Recompensa $" defaultValue={m.recompensa || ''}
                  onBlur={e => actualizarRecompensa(m, e.target.value)}
                  className="rounded-xl px-3 py-2 bg-white border border-red-200 w-full mb-3 text-sm" />
              )}

              <div className="flex gap-2">
                <a href={`/pet/${m.id}`} target="_blank" className="btn-navy rounded-xl px-3 py-2 text-xs flex-1 text-center">Ver perfil</a>
                <button onClick={() => descargarPDF(m)} className="btn-gold rounded-xl px-3 py-2 text-xs flex items-center gap-1">
                  <Download size={14} /> PDF
                </button>
              </div>
            </motion.div>
          ))}
          {mascotas.length === 0 && <p className="text-navy/50 col-span-3 text-center py-10">Aún no registras mascotas.</p>}
        </div>
      </section>
    </main>
  )
}
