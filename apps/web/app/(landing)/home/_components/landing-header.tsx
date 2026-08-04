"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"
import { cn } from "@assistpro/ui"

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Sobre", href: "#sobre" },
  { label: "Preços", href: "#precos" },
  { label: "FAQ", href: "#faq" },
]

export function LandingHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
          <span className="inline-flex size-7 items-center justify-center rounded-lg bg-primary text-xs font-extrabold text-primary-foreground">
            F
          </span>
          <span className="text-base font-extrabold tracking-tight text-foreground">
            floua
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-6 sm:flex" aria-label="Navegação principal">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* CTAs desktop */}
        <div className="hidden items-center gap-3 sm:flex">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Entrar
          </Link>
          <Link
            href="/login"
            className="rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            Começar grátis
          </Link>
        </div>

        {/* Hamburger mobile */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex size-10 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-secondary sm:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        </button>
      </div>

      {/* Menu mobile */}
      {mobileOpen ? (
        <nav
          className="border-t border-border bg-background px-5 pb-5 pt-3 sm:hidden"
          aria-label="Navegação mobile"
        >
          <ul className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="mt-3 flex flex-col gap-2">
              <Link
                href="/login"
                className="block rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
              >
                Entrar
              </Link>
              <Link
                href="/login"
                className="block rounded-xl bg-primary py-2.5 text-center text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
              >
                Começar grátis
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  )
}
