import { CustomerTabs } from "@/components/customers/customer-tabs"
import { appointmentsByCustomer } from "@/lib/mock/appointments"
import { customerById, customers } from "@/lib/mock/customers"
import { chargesByCustomer } from "@/lib/mock/finance"
import { Avatar, formatPhone } from "@assistpro/ui"
import { ArrowLeft, MessageCircle, MoreVertical, Plus } from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const customer = customerById(id)

  return {
    title: customer ? `${customer.name} — assist` : "Cliente — assist",
    description: customer ? `Ficha de ${customer.name}: histórico, financeiro e preferências.` : undefined,
  }
}

export function generateStaticParams() {
  return customers.map((customer) => ({ id: customer.id }))
}

export default async function CustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const customer = customerById(id)

  if (!customer) notFound()

  const appointments = appointmentsByCustomer(customer.id)
  const charges = chargesByCustomer(customer.id)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/clientes"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-secondary"
        >
          <ArrowLeft className="size-4.5" aria-hidden="true" />
          <span className="sr-only">Voltar para clientes</span>
        </Link>

        <Avatar name={customer.name} src={customer.avatarUrl} size="lg" />

        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="truncate text-xl font-bold tracking-tight text-foreground">{customer.name}</h2>
          <p className="truncate text-sm text-muted-foreground">{formatPhone(customer.phone)}</p>
        </div>

        <a
          href={`https://wa.me/55${customer.phone}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success-strong transition-opacity hover:opacity-80"
        >
          <MessageCircle className="size-4.5" aria-hidden="true" />
          <span className="sr-only">Enviar mensagem no WhatsApp</span>
        </a>

        <Link
          href="/atendimentos/novo"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Novo atendimento</span>
        </Link>

        <button
          type="button"
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-secondary"
        >
          <MoreVertical className="size-4" aria-hidden="true" />
          <span className="sr-only">Mais ações</span>
        </button>
      </div>

      <CustomerTabs customer={customer} appointments={appointments} charges={charges} />
    </div>
  )
}
