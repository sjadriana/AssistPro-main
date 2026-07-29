"use client"

import { templateById } from "@/lib/mock/messaging"
import type { MessageStatus, WhatsAppMessage } from "@assistpro/types"
import { Badge, type BadgeTone, Card, CardHeader, formatDate, formatTime, Select } from "@assistpro/ui"
import { AlertTriangle } from "lucide-react"
import { useMemo, useState } from "react"

const statusTone: Record<MessageStatus, BadgeTone> = {
  AGENDADO: "neutral",
  ENVIADO: "primary",
  ENTREGUE: "primary",
  LIDO: "success",
  FALHOU: "danger",
}

const statusLabel: Record<MessageStatus, string> = {
  AGENDADO: "Agendado",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  LIDO: "Lido",
  FALHOU: "Falhou",
}

const filters: { value: MessageStatus | "TODOS"; label: string }[] = [
  { value: "TODOS", label: "Todos os status" },
  { value: "LIDO", label: "Lidos" },
  { value: "ENTREGUE", label: "Entregues" },
  { value: "ENVIADO", label: "Enviados" },
  { value: "FALHOU", label: "Falhas" },
]

export function MessagesTab({ messages }: { messages: WhatsAppMessage[] }) {
  const [status, setStatus] = useState<MessageStatus | "TODOS">("TODOS")

  const visible = useMemo(
    () => (status === "TODOS" ? messages : messages.filter((message) => message.status === status)),
    [messages, status],
  )

  const failures = messages.filter((message) => message.status === "FALHOU").length

  return (
    <div className="flex flex-col gap-3">
      <Select
        value={status}
        aria-label="Filtrar mensagens por status"
        onChange={(event) => setStatus(event.target.value as MessageStatus | "TODOS")}
        className="sm:w-52"
      >
        {filters.map((filter) => (
          <option key={filter.value} value={filter.value}>
            {filter.label}
          </option>
        ))}
      </Select>

      {failures > 0 ? (
        <p className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-xs leading-relaxed text-danger-strong">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          {failures === 1
            ? "1 mensagem não foi entregue. Confira o número do cliente."
            : `${failures} mensagens não foram entregues. Confira os números desses clientes.`}
        </p>
      ) : null}

      <Card>
        <CardHeader
          title="Histórico de mensagens"
          action={<span className="text-xs text-muted-foreground">{visible.length}</span>}
        />

        {visible.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted-foreground">
            Nenhuma mensagem para este filtro.
          </p>
        ) : (
          <ul className="flex flex-col">
            {visible.map((message) => (
              <li key={message.id} className="border-b border-border last:border-b-0">
                <div className="flex flex-col gap-2 px-4 py-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="truncate text-sm font-semibold text-card-foreground">
                        {message.customerName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {templateById(message.templateId).label} · {formatDate(message.sentAt)} às{" "}
                        {formatTime(message.sentAt)}
                      </span>
                    </span>

                    <Badge tone={statusTone[message.status]}>{statusLabel[message.status]}</Badge>
                  </div>

                  {/* whitespace-pre-line preserva as quebras que o cliente vê no WhatsApp. */}
                  <p className="line-clamp-3 rounded-xl bg-secondary px-3 py-2 text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
                    {message.body}
                  </p>

                  {message.failureReason ? (
                    <p className="text-xs font-medium text-danger-strong">{message.failureReason}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
