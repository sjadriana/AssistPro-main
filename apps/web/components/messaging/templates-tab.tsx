"use client"

import type { WhatsAppTemplate } from "@assistpro/types"
import { Badge, Card, CardHeader, Textarea } from "@assistpro/ui"
import { Check, RotateCcw } from "lucide-react"
import { useState } from "react"

const actionButtonClass =
  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"

function TemplateCard({
  template,
  onSave,
  onReset,
}: {
  template: WhatsAppTemplate
  onSave: (id: WhatsAppTemplate["id"], body: string) => void
  onReset: (id: WhatsAppTemplate["id"]) => void
}) {
  const [body, setBody] = useState(template.body)
  const [saved, setSaved] = useState(false)

  const dirty = body !== template.body

  function handleSave() {
    onSave(template.id, body)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  /** Insere a variável no fim do texto — mais previsível que mexer no cursor. */
  function insertVariable(variable: string) {
    setBody((current) => `${current}{{${variable}}}`)
  }

  return (
    <Card>
      <CardHeader title={template.label} />

      <div className="flex flex-col gap-3 px-4 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{template.description}</p>

        <Textarea
          rows={6}
          value={body}
          onChange={(event) => setBody(event.target.value)}
          aria-label={`Texto do modelo ${template.label}`}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-foreground">Variáveis disponíveis</span>
          <div className="flex flex-wrap gap-1.5">
            {template.variables.map((variable) => (
              <button
                key={variable}
                type="button"
                onClick={() => insertVariable(variable)}
                className="rounded-full bg-secondary px-2 py-0.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-primary-soft hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
              >
                {`{{${variable}}}`}
                <span className="sr-only">inserir no texto</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className={`${actionButtonClass} bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40`}
          >
            <Check className="size-3.5" aria-hidden="true" />
            Salvar
          </button>

          <button
            type="button"
            onClick={() => {
              onReset(template.id)
              setBody(template.body)
            }}
            className={`${actionButtonClass} bg-secondary text-muted-foreground hover:opacity-80`}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Descartar
          </button>

          {saved ? <Badge tone="success">Modelo salvo</Badge> : null}
        </div>
      </div>
    </Card>
  )
}

export function TemplatesTab({
  templates,
  onSave,
}: {
  templates: WhatsAppTemplate[]
  onSave: (id: WhatsAppTemplate["id"], body: string) => void
}) {
  // A key força o remount ao descartar, devolvendo o texto salvo ao textarea.
  const [resetKey, setResetKey] = useState(0)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        As variáveis entre chaves são trocadas pelos dados do cliente no momento do envio.
      </p>

      {templates.map((template) => (
        <TemplateCard
          key={`${template.id}-${resetKey}`}
          template={template}
          onSave={onSave}
          onReset={() => setResetKey((current) => current + 1)}
        />
      ))}
    </div>
  )
}
