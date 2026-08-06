"use client"

import type { Charge } from "@assistpro/types"
import {
  Card,
  CardBody,
  CardHeader,
  cn,
  formatCurrency,
  formatDate,
  PaymentBadge,
} from "@assistpro/ui"
import {
  ChevronDown,
  ChevronUp,
  FileText,
  Paperclip,
  Receipt,
  ScrollText,
  Upload,
  X,
} from "lucide-react"
import { useRef, useState } from "react"

// ── Tipos de anexo suportados ────────────────────────────────────────────────

type AttachmentType = "COMPROVANTE" | "NOTA_FISCAL" | "RECIBO" | "CONTRATO" | "OUTRO"

interface Attachment {
  id: string
  type: AttachmentType
  name: string
  size: number
  url: string
}

const ATTACHMENT_LABELS: Record<AttachmentType, string> = {
  COMPROVANTE: "Comprovante",
  NOTA_FISCAL: "Nota fiscal",
  RECIBO: "Recibo",
  CONTRATO: "Contrato",
  OUTRO: "Outro",
}

const ATTACHMENT_ICONS: Record<AttachmentType, React.ElementType> = {
  COMPROVANTE: Receipt,
  NOTA_FISCAL: FileText,
  RECIBO: ScrollText,
  CONTRATO: ScrollText,
  OUTRO: Paperclip,
}

/** Formatos aceitos: PDF, imagens e documentos comuns */
const ACCEPTED = ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx"

// ── Dados mock de anexos por cobrança ───────────────────────────────────────
const mockAttachments: Record<string, Attachment[]> = {
  "chg-1": [
    {
      id: "att-1",
      type: "COMPROVANTE",
      name: "comprovante_pix_mai.pdf",
      size: 142000,
      url: "#",
    },
    {
      id: "att-2",
      type: "NOTA_FISCAL",
      name: "nf_001_joao.pdf",
      size: 89000,
      url: "#",
    },
  ],
  "chg-4": [
    {
      id: "att-3",
      type: "RECIBO",
      name: "recibo_ana_mai.pdf",
      size: 54000,
      url: "#",
    },
  ],
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const METHOD_LABELS: Record<string, string> = {
  PIX: "Pix",
  BOLETO: "Boleto",
  DINHEIRO: "Dinheiro",
  CARTAO: "Cartão",
  TRANSFERENCIA: "Transferência",
}

// ── Painel de anexos de uma cobrança ────────────────────────────────────────

function AttachmentPanel({ chargeId }: { chargeId: string }) {
  const [attachments, setAttachments] = useState<Attachment[]>(
    () => mockAttachments[chargeId] ?? [],
  )
  const [newType, setNewType] = useState<AttachmentType>("COMPROVANTE")
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    const newItems: Attachment[] = files.map((file, i) => ({
      id: `${chargeId}-new-${Date.now()}-${i}`,
      type: newType,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
    }))
    setAttachments((prev) => [...prev, ...newItems])
    e.target.value = ""
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="flex flex-col gap-3 border-t border-border px-4 pb-4 pt-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Anexos
      </p>

      {attachments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum anexo ainda.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {attachments.map((att) => {
            const Icon = ATTACHMENT_ICONS[att.type]
            return (
              <li
                key={att.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5"
              >
                <Icon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="flex min-w-0 flex-1 flex-col">
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="truncate text-sm font-medium text-foreground hover:underline"
                  >
                    {att.name}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {ATTACHMENT_LABELS[att.type]} · {formatBytes(att.size)}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="ml-1 shrink-0 rounded-lg p-1 text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger-strong"
                  aria-label={`Remover ${att.name}`}
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Upload */}
      <div className="flex items-center gap-2">
        <select
          value={newType}
          onChange={(e) => setNewType(e.target.value as AttachmentType)}
          className="h-9 rounded-xl border border-border bg-card px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          aria-label="Tipo do anexo"
        >
          {(Object.keys(ATTACHMENT_LABELS) as AttachmentType[]).map((t) => (
            <option key={t} value={t}>
              {ATTACHMENT_LABELS[t]}
            </option>
          ))}
        </select>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="sr-only"
          aria-label="Selecionar arquivo"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-primary/50 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10"
        >
          <Upload className="size-3.5" aria-hidden="true" />
          Adicionar arquivo
        </button>
      </div>
    </div>
  )
}

// ── Card expandível de uma cobrança ─────────────────────────────────────────

function ChargeCard({ charge }: { charge: Charge }) {
  const [open, setOpen] = useState(false)
  const [notes, setNotes] = useState("")

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Cabeçalho clicável */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/40"
        aria-expanded={open}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold text-card-foreground">
            {charge.description}
          </span>
          <span className="text-xs text-muted-foreground">
            Venc. {formatDate(charge.dueDate)}
          </span>
        </span>
        <span className="text-sm font-bold text-card-foreground">
          {formatCurrency(charge.amount)}
        </span>
        <PaymentBadge status={charge.status} />
        {open ? (
          <ChevronUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {/* Detalhe expandido */}
      {open ? (
        <div className="border-t border-border">
          {/* Campos de detalhe */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 px-4 py-4">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Forma de pagamento</dt>
              <dd className="text-sm font-medium text-card-foreground">
                {charge.method ? METHOD_LABELS[charge.method] : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Data do pagamento</dt>
              <dd className="text-sm font-medium text-card-foreground">
                {charge.paidAt ? formatDate(charge.paidAt) : "—"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Status</dt>
              <dd>
                <PaymentBadge status={charge.status} />
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-muted-foreground">Origem</dt>
              <dd className="text-sm font-medium text-card-foreground">
                {charge.origin === "ATENDIMENTO" ? "Atendimento" : "Avulsa"}
              </dd>
            </div>
          </dl>

          {/* Observações */}
          <div className="border-t border-border px-4 py-3">
            <label
              htmlFor={`obs-${charge.id}`}
              className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Observações
            </label>
            <textarea
              id={`obs-${charge.id}`}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione uma observação sobre esta cobrança..."
              rows={2}
              className={cn(
                "w-full resize-none rounded-xl border border-border bg-secondary/40 px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground",
                "focus:outline-none focus:ring-2 focus:ring-primary/40",
              )}
            />
          </div>

          {/* Anexos */}
          <AttachmentPanel chargeId={charge.id} />
        </div>
      ) : null}
    </li>
  )
}

// ── Componente principal ─────────────────────────────────────────────────────

export function CustomerFinanceTab({ charges }: { charges: Charge[] }) {
  const totalPaid = charges
    .filter((c) => c.status === "PAGO")
    .reduce((sum, c) => sum + c.amount, 0)

  const totalPending = charges
    .filter((c) => c.status === "PENDENTE" || c.status === "ATRASADO")
    .reduce((sum, c) => sum + c.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="text-xs text-muted-foreground">Recebido</span>
          <span className="text-lg font-bold text-success-strong">{formatCurrency(totalPaid)}</span>
        </div>
        <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card px-4 py-3">
          <span className="text-xs text-muted-foreground">Em aberto</span>
          <span className="text-lg font-bold text-warning-strong">{formatCurrency(totalPending)}</span>
        </div>
      </div>

      {/* Lista de cobranças */}
      <Card>
        <CardHeader title={`Cobranças (${charges.length})`} />
        <CardBody className="p-4">
          {charges.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhuma cobrança registrada.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {charges.map((charge) => (
                <ChargeCard key={charge.id} charge={charge} />
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
