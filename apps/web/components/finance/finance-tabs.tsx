"use client"

import { cn } from "@assistpro/ui"
import { ArrowDownCircle, ArrowUpCircle } from "lucide-react"
import { useState } from "react"
import { ExpenseView } from "./expense-view"
import { FinanceView } from "./finance-view"

type FinanceTab = "receitas" | "despesas"

const tabs: { id: FinanceTab; label: string; icon: React.ElementType; description: string }[] = [
  {
    id: "receitas",
    label: "Receitas",
    icon: ArrowUpCircle,
    description: "Cobranças geradas para clientes",
  },
  {
    id: "despesas",
    label: "Despesas",
    icon: ArrowDownCircle,
    description: "Gastos e contas do seu negócio",
  },
]

export function FinanceTabs() {
  const [activeTab, setActiveTab] = useState<FinanceTab>("receitas")

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex gap-2 rounded-2xl bg-card p-1.5 shadow-sm">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              aria-selected={active}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                active
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Icon
                className={cn("size-4 shrink-0", active ? "text-primary-foreground" : "text-muted-foreground")}
                aria-hidden="true"
              />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeTab === "receitas" ? <FinanceView /> : <ExpenseView />}
    </div>
  )
}
