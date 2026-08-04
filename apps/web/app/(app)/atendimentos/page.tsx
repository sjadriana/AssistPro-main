import { AppointmentList } from "@/components/appointments/appointment-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Atendimentos — floua",
  description: "Acompanhe seus atendimentos, confirme presenças e registre conclusões.",
}

export default function AppointmentsPage() {
  return <AppointmentList />
}
