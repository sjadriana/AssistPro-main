import { ReportsView } from "@/components/reports/reports-view"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Relatórios — floua",
  description: "Receita por mês, origem das cobranças, clientes que mais pagaram e ocupação da agenda.",
}

export default function ReportsPage() {
  return <ReportsView />
}
