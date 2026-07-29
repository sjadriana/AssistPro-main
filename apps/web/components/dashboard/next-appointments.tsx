import { freeSlotToday, todayAppointments } from "@/lib/mock/appointments"
import { AppointmentBadge, Card, CardBody, CardHeader, formatDayMonth, formatTime } from "@assistpro/ui"
import { Plus } from "lucide-react"
import Link from "next/link"

export function NextAppointments() {
  const today = todayAppointments[0]

  return (
    <Card>
      <CardHeader
        title="Próximos atendimentos"
        action={
          <Link href="/agenda" className="text-xs font-semibold text-primary transition-opacity hover:opacity-70">
            Ver agenda completa
          </Link>
        }
      />

      <CardBody className="p-0">
        <p className="px-5 py-3 text-xs font-medium text-muted-foreground">
          Hoje, {formatDayMonth(today.startsAt)}
        </p>

        <ul className="flex flex-col">
          {todayAppointments.map((appointment) => (
            <li key={appointment.id} className="border-t border-border">
              <Link
                href={`/clientes/${appointment.customerId}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-secondary/60"
              >
                <span className="w-12 shrink-0 text-sm font-semibold text-card-foreground">
                  {formatTime(appointment.startsAt)}
                </span>

                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium text-card-foreground">{appointment.customerName}</span>
                  <span className="truncate text-xs text-muted-foreground">{appointment.serviceName}</span>
                </span>

                <AppointmentBadge status={appointment.status} />
              </Link>
            </li>
          ))}

          <li className="border-t border-border">
            <div className="flex items-center gap-4 px-5 py-3.5">
              <span className="w-12 shrink-0 text-sm font-semibold text-muted-foreground">
                {formatTime(freeSlotToday.startsAt)}
              </span>

              <span className="flex min-w-0 flex-1 flex-col">
                <span className="text-sm font-medium text-muted-foreground">Horário livre</span>
                <span className="text-xs text-muted-foreground">Disponível para agendamento</span>
              </span>

              <Link
                href="/atendimentos/novo"
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary transition-opacity hover:opacity-70"
              >
                <Plus className="size-4" aria-hidden="true" />
                <span className="sr-only">Agendar às {formatTime(freeSlotToday.startsAt)}</span>
              </Link>
            </div>
          </li>
        </ul>
      </CardBody>
    </Card>
  )
}
