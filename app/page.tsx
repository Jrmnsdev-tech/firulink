'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { PawPrint, ShieldCheck, QrCode, Users, Sparkles } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const PAISES = ['Argentina','Bolivia','Chile','Colombia','Costa Rica','Ecuador','España','México','Paraguay','Perú','Uruguay','Venezuela','Otro']

export default function Landing() {
  const router = useRouter()
  const [modo, setModo] = useState<'login' | 'registro' | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) return setError(error.message)
    router.push('/dashboard')
  }

  const handleRegistro = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pais) { setError('Debes elegir tu país'); return }
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) { setLoading(false); return setError(error.message) }
    if (data.user) {
      await supabase.from('usuarios').insert({ id: data.user.id, email, nombre, pais })
    }
    setLoading(false)
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen relative overflow-hidden">
      <div className="sticky top-0 z-50 bg-gradient-to-r from-navy via-navy-light to-navy text-gold text-center py-2 text-sm font-semibold flex items-center justify-center gap-2">
        <Sparkles size={16} className="text-gold" /> Registro 100% GRATIS este mes — Protege a tu mascota ahora
      </div>

      <div className="absolute -top-24 -right-24 w-96 h-96 bg-gold/20 rounded-full blur-3xl" />
      <div className="absolute top-40 -left-24 w-96 h-96 bg-navy/10 rounded-full blur-3xl" />

      <section className="max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="flex items-center gap-2 mb-4">
            <PawPrint className="text-gold" size={36} />
            <h1 className="text-3xl font-bold text-navy">FiruLink</h1>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-navy leading-tight mb-4">
            El carnet digital que <span className="text-gold">protege</span> a tu mejor amigo.
          </h2>
          <p className="text-navy/70 text-lg mb-8">
            Registra a tu mascota, genera su credencial con código QR y actívala en la comunidad si alguna vez se pierde.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: QrCode, label: 'QR único' },
              { icon: ShieldCheck, label: 'Alertas ¡SE BUSCA!' },
              { icon: Users, label: 'Comunidad local' },
            ].map((f, i) => (
              <div key={i} className="glass rounded-2xl p-4 text-center">
                <f.icon className="mx-auto text-navy mb-2" size={24} />
                <p className="text-xs font-semibold text-navy/80">{f.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-8">
          {!modo && (
            <div className="flex flex-col gap-4">
              <h3 className="text-xl font-bold text-navy mb-2 text-center">Comienza gratis</h3>
              <button onClick={() => setModo('registro')} className="btn-gold rounded-xl py-3">Crear cuenta</button>
              <button onClick={() => setModo('login')} className="btn-navy rounded-xl py-3">Ya tengo cuenta</button>
            </div>
          )}

          {modo === 'login' && (
            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-navy mb-2">Iniciar sesión</h3>
              <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
              <input required type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
                className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button disabled={loading} className="btn-gold rounded-xl py-3 mt-2">{loading ? 'Ingresando...' : 'Ingresar'}</button>
              <button type="button" onClick={() => setModo(null)} className="text-navy/60 text-sm">Volver</button>
            </form>
          )}

          {modo === 'registro' && (
            <form onSubmit={handleRegistro} className="flex flex-col gap-3">
              <h3 className="text-xl font-bold text-navy mb-2">Crear cuenta gratis</h3>
              <input required placeholder="Tu nombre" value={nombre} onChange={e => setNombre(e.target.value)}
                className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
              <select required value={pais} onChange={e => setPais(e.target.value)}
                className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10">
                <option value="">Selecciona tu país *</option>
                {PAISES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input required type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
              <input required type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
                className="rounded-xl px-4 py-3 bg-white/70 border border-navy/10" />
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <button disabled={loading} className="btn-gold rounded-xl py-3 mt-2">{loading ? 'Creando...' : 'Registrarme gratis'}</button>
              <button type="button" onClick={() => setModo(null)} className="text-navy/60 text-sm">Volver</button>
            </form>
          )}
        </motion.div>
      </section>
    </main>
  )
}
