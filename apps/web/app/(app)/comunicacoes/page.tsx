import { CommunicationsView } from "@/components/messaging/communications-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Comunicações — floua",
  description:
    "Histórico de mensagens no WhatsApp, régua de cobrança automática todo dia 30 e modelos de mensagem editáveis.",
}

export default function CommunicationsPage() {
  return <CommunicationsView />
}
