import { FinanceTabs } from "@/components/finance/finance-tabs"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Financeiro — floua",
  description: "Gerencie receitas, cobranças e despesas do seu negócio.",
}

export default function FinancePage() {
  return <FinanceTabs />
}
