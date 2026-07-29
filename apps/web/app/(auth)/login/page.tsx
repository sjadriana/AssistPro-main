import { LoginForm } from "@/components/auth/login-form"
import { LogoMark } from "@/components/brand/logo"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Entrar",
  description: "Acesse sua agenda no assist.",
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="flex w-full max-w-sm flex-col gap-7 rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <header className="flex flex-col items-center gap-2 text-center">
          <div className="flex items-center gap-2">
            <LogoMark className="size-8" />
            <span className="text-2xl font-bold tracking-tight text-foreground">assist</span>
          </div>
          <p className="text-sm text-muted-foreground">sua agenda, sua rotina, organizada.</p>
        </header>

        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold text-balance text-foreground">Bem-vinda de volta</h1>
          <p className="text-sm text-muted-foreground">Faça login para continuar</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link href="/criar-conta" className="font-semibold text-primary underline-offset-4 hover:underline">
            Criar conta
          </Link>
        </p>

        <div className="overflow-hidden rounded-2xl bg-primary-soft">
          <Image
            src="/images/login-illustration.png"
            alt="Ilustração de uma profissional organizando sua agenda no computador"
            width={640}
            height={420}
            priority
            className="h-auto w-full"
          />
        </div>
      </div>
    </main>
  )
}
