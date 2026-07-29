import { FinanceView } from "@/components/finance/finance-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financeiro — assist",
  description: "Acompanhe receitas previstas, recebidas e pendentes e registre pagamentos dos seus atendimentos.",
}

export default function FinancePage() {
  return <FinanceView />
}
