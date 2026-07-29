import { AppointmentForm } from "@/components/appointments/appointment-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novo atendimento — assist",
  description: "Agende um atendimento com confirmação e lembretes automáticos por WhatsApp.",
}

export default function NewAppointmentPage() {
  return <AppointmentForm />
}
