import { AssistantFeed } from "@/components/dashboard/assistant-feed"
import { MetricCard } from "@/components/dashboard/metric-card"
import { NextAppointments } from "@/components/dashboard/next-appointments"
import { currentUser, dashboardMetrics } from "@/lib/mock/assistant"
import { CalendarCheck, CalendarClock, Clock, Receipt } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Dashboard — floua",
  description: "Resumo do dia: atendimentos, confirmações pendentes e horários livres.",
}

const firstName = currentUser.name.split(" ")[0]

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-balance text-foreground lg:text-3xl">
          Bom dia, {firstName}!
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">Aqui está o que acontece hoje.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <MetricCard
          value={dashboardMetrics.appointmentsToday}
          label="Atendimentos hoje"
          icon={CalendarCheck}
          tone="success"
          action={{ label: "Ver agenda", href: "/agenda" }}
        />
        <MetricCard
          value={dashboardMetrics.awaitingConfirmation}
          label="Aguardando confirmação"
          icon={CalendarClock}
          tone="warning"
          action={{ label: "Ver lista", href: "/atendimentos" }}
        />
        <MetricCard
          value={dashboardMetrics.pendingPayments}
          label="Pagamento pendente"
          icon={Receipt}
          tone="danger"
          action={{ label: "Ver cobranças", href: "/financeiro" }}
        />
        <MetricCard
          value={dashboardMetrics.freeSlots}
          label="Horários livres"
          icon={Clock}
          tone="neutral"
          action={{ label: "Ver disponibilidade", href: "/agenda" }}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <AssistantFeed />
        <NextAppointments />
      </div>
    </div>
  )
}
