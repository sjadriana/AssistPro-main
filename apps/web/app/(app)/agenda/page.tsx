import { AgendaView } from "@/components/agenda/agenda-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Agenda — assist",
  description: "Visualize seus atendimentos por dia, semana ou mês e encontre horários livres.",
}

export default function AgendaPage() {
  return <AgendaView />
}
