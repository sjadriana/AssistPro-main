import { openBalancesByCustomer } from "@/lib/finance"
import { appointments } from "@/lib/mock/appointments"
import { customers } from "@/lib/mock/customers"
import { charges } from "@/lib/mock/finance"
import {
  appointmentsByService,
  attendanceStats,
  averageTicket,
  receivedByMonth,
  receivedByOrigin,
  topCustomers,
} from "@/lib/reports"
import { Card, CardBody, CardHeader, cn, formatCurrency } from "@assistpro/ui"
import { ReportBars } from "./report-bars"

function StatTile({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "danger" }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-xs">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span
        className={cn(
          "text-xl font-bold tracking-tight tabular-nums",
          tone === "danger" ? "text-danger-strong" : "text-card-foreground",
        )}
      >
        {value}
      </span>
      <span className="text-xs leading-relaxed text-muted-foreground">{hint}</span>
    </div>
  )
}

/**
 * Relatórios derivados dos mesmos dados das outras telas — nada é digitado
 * aqui, tudo é calculado a partir das cobranças e dos atendimentos.
 */
export function ReportsView() {
  const monthly = receivedByMonth(charges)
  const byOrigin = receivedByOrigin(charges)
  const topPayers = topCustomers(charges)
  const services = appointmentsByService(appointments)
  const attendance = attendanceStats(appointments)
  const ticket = averageTicket(charges)

  const openBalances = openBalancesByCustomer(charges, customers)
  const totalOpen = openBalances.reduce((total, balance) => total + balance.totalOpen, 0)
  const overdueCustomers = openBalances.filter((balance) => balance.hasOverdue).length

  const totalReceived = monthly.reduce((total, bar) => total + bar.value, 0)

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Relatórios</h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Como o dinheiro entrou e como a agenda foi usada nos últimos seis meses.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Recebido" value={formatCurrency(totalReceived)} hint="Últimos 6 meses" />
        <StatTile label="Ticket médio" value={formatCurrency(ticket)} hint="Por cobrança paga" />
        <StatTile
          label="Em aberto"
          value={formatCurrency(totalOpen)}
          hint={overdueCustomers === 1 ? "1 cliente em atraso" : `${overdueCustomers} clientes em atraso`}
          tone={totalOpen > 0 ? "danger" : undefined}
        />
        <StatTile
          label="Cancelamentos"
          value={`${attendance.cancellationRate}%`}
          hint={`${attendance.cancelled} de ${attendance.total} atendimentos`}
        />
      </div>

      <Card>
        <CardHeader title="Recebido por mês" description="Considera a data do pagamento, não do vencimento" />
        <CardBody>
          <ReportBars bars={monthly} />
        </CardBody>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="Origem da receita" description="De onde vieram as cobranças pagas" />
          <CardBody>
            <ReportBars bars={byOrigin} emptyMessage="Nenhuma cobrança paga ainda." />
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Clientes que mais pagaram" description="Top 5 por valor recebido" />
          <CardBody>
            <ReportBars bars={topPayers} emptyMessage="Nenhum pagamento registrado." />
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader title="Atendimentos por serviço" description="Cancelados não entram na contagem" />
        <CardBody>
          <ReportBars bars={services} format="count" emptyMessage="Nenhum atendimento na agenda." />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Ocupação da agenda" description={`${attendance.total} atendimentos registrados`} />
        <CardBody>
          <dl className="flex flex-col gap-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Concluídos</dt>
              <dd className="font-semibold text-card-foreground tabular-nums">{attendance.completed}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Agendados</dt>
              <dd className="font-semibold text-card-foreground tabular-nums">{attendance.scheduled}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted-foreground">Cancelados</dt>
              <dd className="font-semibold text-danger-strong tabular-nums">{attendance.cancelled}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
    </div>
  )
}
