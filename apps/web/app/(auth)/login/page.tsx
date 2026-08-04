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

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    router.push("/dashboard")
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden bg-[#f0eef8]">
      {/* Decoração — "F" grande desfocado no canto superior direito */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-10 -right-10 select-none text-[260px] font-black leading-none text-primary/10">
        f
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm rounded-3xl bg-white px-8 py-8 shadow-xl">
        {/* Logo */}
        <div className="mb-5 flex items-center justify-center gap-2.5">
          <FlouaIcon className="size-8" />
          <span className="text-2xl font-bold tracking-tight text-foreground">floua</span>
        </div>

        {/* Título */}
        <h1 className="text-center text-[1.35rem] font-bold text-foreground">Que bom te ver de volta</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">Acesse sua conta para continuar</p>

        {/* Google */}
        <button
          type="button"
          className="mt-5 flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-secondary"
        >
          <GoogleIcon />
          Continuar com o Google
        </button>

        {/* Divisor */}
        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">ou com e-mail</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <Field label="E-mail" htmlFor="email">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="adriana@floua.app"
              defaultValue="adriana@floua.app"
              required
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link
                href="/recuperar-senha"
                className="text-xs font-medium text-primary underline-offset-4 hover:underline"
              >
                Esqueci minha senha
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                defaultValue="adriana@floua.app"
                className="pr-11"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute top-1/2 right-2.5 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary"
              >
                {showPassword
                  ? <EyeOff className="size-4" aria-hidden="true" />
                  : <Eye className="size-4" aria-hidden="true" />}
                <span className="sr-only">{showPassword ? "Ocultar senha" : "Mostrar senha"}</span>
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2.5 text-sm text-foreground">
            <input
              type="checkbox"
              name="remember"
              defaultChecked
              className="size-4 rounded-sm accent-primary"
            />
            Lembrar de mim
          </label>

          <button
            type="submit"
            disabled={submitting}
            className="mt-0.5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-70"
          >
            {submitting ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
            Entrar
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/criar-conta" className="font-semibold text-primary underline-offset-4 hover:underline">
            Criar conta grátis
          </Link>
        </p>
      </div>
    </div>
  )
}
