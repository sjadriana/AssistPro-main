"use client"

import { FlouaIcon } from "@/components/brand/logo"
import { Field, Input, Label } from "@assistpro/ui"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    router.push("/dashboard")
  }

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#ede9f6] px-4">
      {/* Decoração — "f" grande e desfocado no canto */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-4 select-none font-bold text-[220px] leading-none text-primary/10"
      >
        f
      </span>

      {/* Card */}
      <div className="relative w-full max-w-sm rounded-3xl bg-card px-8 py-8 shadow-lg">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2.5">
          <FlouaIcon className="size-8" />
          <span className="text-2xl font-bold tracking-tight text-foreground">floua</span>
        </div>

        {/* Título */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-foreground">Que bom te ver de volta</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse sua conta para continuar</p>
        </div>

        {/* Botão Google */}
        <button
          type="button"
          className="mb-4 flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          <GoogleIcon />
          Continuar com o Google
        </button>

        {/* Divisor */}
        <div className="mb-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou com e-mail</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Field>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="adriana@floua.app"
              autoComplete="email"
              required
            />
          </Field>

          <Field>
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/esqueci-senha"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword
                  ? <EyeOff className="size-4" aria-hidden="true" />
                  : <Eye className="size-4" aria-hidden="true" />}
              </button>
            </div>
          </Field>

          {/* Lembrar de mim */}
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="size-4 rounded accent-primary"
            />
            <span className="text-sm text-foreground">Lembrar de mim</span>
          </label>

          {/* Botão Entrar */}
          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            Entrar
          </button>
        </form>

        {/* Criar conta */}
        <p className="mt-5 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="font-semibold text-primary hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
