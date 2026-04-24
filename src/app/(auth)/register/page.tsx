'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.get('name'),
        email: form.get('email'),
        password: form.get('password'),
      }),
    })

    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.message ?? 'Erro ao criar conta')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-[38px] h-[38px] rounded-[11px] bg-primary flex items-center justify-center">
            <Activity className="w-[22px] h-[22px] text-primary-foreground" strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-display font-bold text-[18px] text-foreground leading-none tracking-tight">
              PhisioFlow
            </p>
            <p className="font-body text-[8.5px] font-bold uppercase tracking-[0.22em] text-muted-foreground mt-1 leading-tight">
              Portal Restaurativo
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-[18px] shadow-sm p-8">
          <h1 className="font-display font-bold text-[28px] text-foreground tracking-tight leading-tight mb-1">
            Crie sua conta
          </h1>
          <p className="font-body text-[14px] text-muted-foreground mb-7">
            Comece a organizar sua clínica hoje.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                Nome completo
              </label>
              <input
                name="name"
                type="text"
                required
                placeholder="Dra. Ana Lima"
                className={cn(
                  'w-full bg-input border border-border rounded-xl px-[14px] py-[11px]',
                  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
                  'outline-none focus:ring-2 focus:ring-ring transition-all duration-[180ms]'
                )}
              />
            </div>

            <div>
              <label className="block font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="seu@email.com"
                className={cn(
                  'w-full bg-input border border-border rounded-xl px-[14px] py-[11px]',
                  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
                  'outline-none focus:ring-2 focus:ring-ring transition-all duration-[180ms]'
                )}
              />
            </div>

            <div>
              <label className="block font-body text-[10.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground mb-2">
                Senha
              </label>
              <input
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Mínimo 8 caracteres"
                className={cn(
                  'w-full bg-input border border-border rounded-xl px-[14px] py-[11px]',
                  'font-body text-[14px] text-foreground placeholder:text-muted-foreground',
                  'outline-none focus:ring-2 focus:ring-ring transition-all duration-[180ms]'
                )}
              />
            </div>

            {error && (
              <p className="font-body text-[13px] text-danger bg-danger-soft rounded-xl px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className={cn(
                'w-full bg-accent text-accent-foreground font-body font-semibold text-[14px]',
                'px-[18px] py-[11px] rounded-xl transition-all duration-[180ms]',
                'hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed'
              )}
            >
              {loading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-[13px] text-muted-foreground mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
