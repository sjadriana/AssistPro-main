"use client"

import { expenses as initialExpenses } from "@/lib/mock/finance"
import type { CreateExpenseInput, Expense, ExpenseAttachment, ExpenseCategory, ExpenseStatus } from "@assistpro/types"
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  cn,
  Field,
  formatCurrency,
  formatDate,
  Input,
  Label,
  Select,
} from "@assistpro/ui"
import {
  Building2,
  ChevronDown,
  ChevronUp,
  FileText,
  Laptop,
  Megaphone,
  Package,
  Paperclip,
  Plus,
  Receipt,
  RefreshCw,
  Repeat,
  RotateCcw,
  Wallet,
  Wrench,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

// ── Helpers ──────────────────────────────────────────────────────────────────

const categoryLabels: Record<ExpenseCategory, string> = {
  ALUGUEL: "Aluguel",
  EQUIPAMENTO: "Equipamento",
  PLATAFORMA: "Plataforma/Software",
  MARKETING: "Marketing",
  CONTABILIDADE: "Contabilidade",
  IMPOSTOS: "Impostos",
  SALARIO: "Salário",
  MANUTENCAO: "Manutenção",
  OUTRO: "Outro",
}

const categoryIcons: Record<ExpenseCategory, React.ReactNode> = {
  ALUGUEL: <Building2 className="size-4" />,
  EQUIPAMENTO: <Package className="size-4" />,
  PLATAFORMA: <Laptop className="size-4" />,
  MARKETING: <Megaphone className="size-4" />,
  CONTABILIDADE: <FileText className="size-4" />,
  IMPOSTOS: <Receipt className="size-4" />,
  SALARIO: <Wallet className="size-4" />,
  MANUTENCAO: <Wrench className="size-4" />,
  OUTRO: <RefreshCw className="size-4" />,
}

const statusLabels: Record<ExpenseStatus, string> = {
  PAGO: "Pago",
  PENDENTE: "Pendente",
  ATRASADO: "Atrasado",
}

const statusTone: Record<ExpenseStatus, "success" | "warning" | "danger"> = {
  PAGO: "success",
  PENDENTE: "warning",
  ATRASADO: "danger",
}

const methodLabels: Record<string, string> = {
  PIX: "Pix",
  BOLETO: "Boleto",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  TRANSFERENCIA: "Transferência",
}

const attachmentKindLabels: Record<ExpenseAttachment["kind"], string> = {
  COMPROVANTE: "Comprovante",
  NOTA_FISCAL: "Nota fiscal",
  RECIBO: "Recibo",
  CONTRATO: "Contrato",
  OUTRO: "Outro",
}

const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"

function inferKind(name: string): ExpenseAttachment["kind"] {
  const lower = name.toLowerCase()
  if (lower.includes("nf") || lower.includes("nota")) return "NOTA_FISCAL"
  if (lower.includes("recibo")) return "RECIBO"
  if (lower.includes("contrato")) return "CONTRATO"
  if (lower.includes("comprova")) return "COMPROVANTE"
  return "OUTRO"
}

function inferType(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "outro"
  return ext
}

// ── Sub-componente: formulário nova despesa ───────────────────────────────────

function NewExpenseForm({ onSave, onCancel }: { onSave: (input: CreateExpenseInput) => void; onCancel: () => void }) {
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<ExpenseCategory>("OUTRO")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [method, setMethod] = useState("")
  const [recurring, setRecurring] = useState(false)
  const [notes, setNotes] = useState("")

  function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!description || !amount || !dueDate) return
    onSave({
      description,
      category,
      amount: Math.round(parseFloat(amount.replace(",", ".")) * 100),
      dueDate,
      method: method ? (method as CreateExpenseInput["method"]) : null,
      recurring,
      notes: notes || null,
    })
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4">
      <p className="text-sm font-semibold text-foreground">Nova despesa</p>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Descrição" htmlFor="exp-desc" className="col-span-2">
          <Input id="exp-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex: Aluguel da sala" required />
        </Field>

        <Field label="Categoria" htmlFor="exp-cat">
          <Select id="exp-cat" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>

        <Field label="Valor (R$)" htmlFor="exp-amount">
          <Input id="exp-amount" type="number" min="0" step="0.01" placeholder="0,00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        </Field>

        <Field label="Vencimento" htmlFor="exp-due">
          <Input id="exp-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        </Field>

        <Field label="Forma de pagamento" htmlFor="exp-method">
          <Select id="exp-method" value={method} onChange={(e) => setMethod(e.target.value)}>
            <option value="">Não informado</option>
            {Object.entries(methodLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Observações" htmlFor="exp-notes">
        <textarea
          id="exp-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Informações adicionais..."
          rows={2}
          className="w-full resize-none rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
      </Field>

      <label className="flex cursor-pointer items-center gap-2.5">
        <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="size-4 rounded accent-primary" />
        <span className="flex items-center gap-1.5 text-sm text-foreground">
          <Repeat className="size-3.5 text-muted-foreground" aria-hidden="true" />
          Despesa recorrente mensal
        </span>
      </label>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90">
          Salvar
        </button>
        <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-secondary">
          Cancelar
        </button>
      </div>
    </form>
  )
}

// ── Sub-componente: card de despesa ──────────────────────────────────────────

function ExpenseCard({ expense, onMarkPaid }: { expense: Expense; onMarkPaid: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<ExpenseAttachment[]>(expense.attachments)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const next: ExpenseAttachment[] = files.map((f) => ({
      id: `att-${Date.now()}-${f.name}`,
      name: f.name,
      type: inferType(f.name),
      url: URL.createObjectURL(f),
      kind: inferKind(f.name),
      uploadedAt: new Date().toISOString(),
    }))
    setAttachments((prev) => [...prev, ...next])
    e.target.value = ""
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <li className="flex flex-col border-b border-border last:border-b-0">
      {/* Linha principal */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
        aria-expanded={expanded}
      >
        <span className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-xl",
          expense.status === "PAGO" ? "bg-success-soft text-success-strong" :
          expense.status === "ATRASADO" ? "bg-danger-soft text-danger-strong" :
          "bg-secondary text-muted-foreground"
        )}>
          {categoryIcons[expense.category]}
        </span>

        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{expense.description}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {categoryLabels[expense.category]}
            {expense.recurring ? <Repeat className="size-3" aria-label="Recorrente" /> : null}
          </span>
        </span>

        <span className="flex flex-col items-end gap-1">
          <span className="text-sm font-semibold text-foreground">{formatCurrency(expense.amount)}</span>
          <Badge tone={statusTone[expense.status]}>{statusLabels[expense.status]}</Badge>
        </span>

        {expanded
          ? <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          : <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        }
      </button>

      {/* Painel expandido */}
      {expanded ? (
        <div className="flex flex-col gap-4 bg-secondary/30 px-4 pb-4 pt-2">
          {/* Detalhes */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            <div>
              <dt className="text-muted-foreground">Vencimento</dt>
              <dd className="font-medium text-foreground">{formatDate(expense.dueDate)}</dd>
            </div>
            {expense.paidAt ? (
              <div>
                <dt className="text-muted-foreground">Pago em</dt>
                <dd className="font-medium text-foreground">{formatDate(expense.paidAt)}</dd>
              </div>
            ) : null}
            {expense.method ? (
              <div>
                <dt className="text-muted-foreground">Forma de pagamento</dt>
                <dd className="font-medium text-foreground">{methodLabels[expense.method] ?? expense.method}</dd>
              </div>
            ) : null}
          </dl>

          {/* Observações */}
          {expense.notes ? (
            <p className="rounded-xl border border-border bg-card px-3.5 py-2.5 text-xs text-muted-foreground">
              {expense.notes}
            </p>
          ) : null}

          {/* Anexos */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium text-foreground">Anexos</Label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary/80"
              >
                <Paperclip className="size-3" aria-hidden="true" />
                Adicionar
              </button>
              <input ref={fileRef} type="file" multiple accept={ACCEPTED_EXTENSIONS} onChange={handleFileChange} className="hidden" aria-label="Adicionar anexos" />
            </div>

            {attachments.length === 0 ? (
              <p className="text-xs text-muted-foreground">Nenhum anexo adicionado.</p>
            ) : (
              <ul className="flex flex-col gap-1.5">
                {attachments.map((att) => (
                  <li key={att.id} className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
                    <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-xs font-medium text-foreground">{att.name}</span>
                      <span className="text-xs text-muted-foreground">{attachmentKindLabels[att.kind]}</span>
                    </span>
                    <a href={att.url} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-medium text-primary hover:underline">Ver</a>
                    <button type="button" onClick={() => removeAttachment(att.id)} className="shrink-0 text-muted-foreground hover:text-danger-strong" aria-label="Remover">
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Ação marcar como pago */}
          {expense.status !== "PAGO" ? (
            <button
              type="button"
              onClick={() => onMarkPaid(expense.id)}
              className="flex items-center justify-center gap-2 rounded-xl bg-success-soft px-4 py-2.5 text-sm font-semibold text-success-strong transition-opacity hover:opacity-80"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Marcar como pago
            </button>
          ) : null}
        </div>
      ) : null}
    </li>
  )
}

// ── View principal ───────────────────────────────────────────────────────────

export function ExpenseView() {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)
  const [showForm, setShowForm] = useState(false)
  const [filterStatus, setFilterStatus] = useState<ExpenseStatus | "TODOS">("TODOS")
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | "TODAS">("TODAS")

  const totalPaid = expenses.filter((e) => e.status === "PAGO").reduce((s, e) => s + e.amount, 0)
  const totalPending = expenses.filter((e) => e.status !== "PAGO").reduce((s, e) => s + e.amount, 0)

  const visible = expenses.filter((e) => {
    if (filterStatus !== "TODOS" && e.status !== filterStatus) return false
    if (filterCategory !== "TODAS" && e.category !== filterCategory) return false
    return true
  })

  function handleSave(input: CreateExpenseInput) {
    const now = new Date().toISOString()
    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      paidAt: null,
      status: "PENDENTE",
      attachments: [],
      ...input,
      method: input.method ?? null,
      notes: input.notes ?? null,
      recurring: input.recurring ?? false,
    }
    setExpenses((prev) => [newExpense, ...prev])
    setShowForm(false)
  }

  function handleMarkPaid(id: string) {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, status: "PAGO" as const, paidAt: new Date().toISOString().slice(0, 10), updatedAt: new Date().toISOString() }
          : e,
      ),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Pago no período</span>
          <span className="text-xl font-bold text-success-strong">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4">
          <span className="text-xs font-medium text-muted-foreground">Em aberto</span>
          <span className="text-xl font-bold text-warning-strong">{formatCurrency(totalPending)}</span>
        </div>
      </div>

      {/* Formulário nova despesa */}
      {showForm ? (
        <NewExpenseForm onSave={handleSave} onCancel={() => setShowForm(false)} />
      ) : null}

      {/* Lista */}
      <Card>
        <CardHeader
          title="Despesas"
          action={
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
            >
              <Plus className="size-3.5" aria-hidden="true" />
              Nova despesa
            </button>
          }
        />

        {/* Filtros */}
        <div className="flex gap-2 border-b border-border px-4 pb-3 pt-1">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as ExpenseStatus | "TODOS")}
            aria-label="Filtrar por status"
            className="text-xs"
          >
            <option value="TODOS">Todos os status</option>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>

          <Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ExpenseCategory | "TODAS")}
            aria-label="Filtrar por categoria"
            className="text-xs"
          >
            <option value="TODAS">Todas as categorias</option>
            {Object.entries(categoryLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </Select>
        </div>

        <CardBody className="p-0">
          {visible.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted-foreground">Nenhuma despesa encontrada.</p>
          ) : (
            <ul>
              {visible.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} onMarkPaid={handleMarkPaid} />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
