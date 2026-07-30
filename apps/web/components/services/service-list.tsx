"use client"

import { ServiceForm } from "@/components/services/service-form"
import { services as initialServices } from "@/lib/mock/services"
import type { Service, ServiceColor } from "@assistpro/types"
import { cn } from "@assistpro/ui"
import { Clock, Pencil, Plus, User, Users } from "lucide-react"
import { useState } from "react"

const colorDot: Record<ServiceColor, string> = {
  emerald: "bg-emerald-500",
  violet:  "bg-violet-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
  sky:     "bg-sky-500",
}

function formatDuration(mins: number) {
  if (mins === 0) return "—"
  if (mins < 60) return `${mins} min`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h` : `${h}h ${m}min`
}

type EditState = { mode: "new" } | { mode: "edit"; service: Service } | { mode: "list" }

export function ServiceList() {
  const [services, setServices] = useState<Service[]>(
    initialServices.filter((s) => s.active),
  )
  const [editState, setEditState] = useState<EditState>({ mode: "list" })

  function handleSave(
    data: Omit<Service, "id" | "createdAt" | "updatedAt" | "deletedAt" | "price" | "active">,
  ) {
    const now = new Date().toISOString()

    if (editState.mode === "new") {
      const newService: Service = {
        ...data,
        id: `svc-${Date.now()}`,
        price: 0,
        active: true,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      }
      setServices((prev) => [...prev, newService])
    } else if (editState.mode === "edit") {
      setServices((prev) =>
        prev.map((s) =>
          s.id === editState.service.id ? { ...s, ...data, updatedAt: now } : s,
        ),
      )
    }

    setEditState({ mode: "list" })
  }

  if (editState.mode === "new") {
    return (
      <ServiceForm
        onSave={handleSave}
        onCancel={() => setEditState({ mode: "list" })}
      />
    )
  }

  if (editState.mode === "edit") {
    return (
      <ServiceForm
        service={editState.service}
        onSave={handleSave}
        onCancel={() => setEditState({ mode: "list" })}
      />
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {services.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Nenhum serviço cadastrado ainda.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {services.map((service) => (
            <li
              key={service.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-secondary/50"
            >
              {/* Cor */}
              <span
                className={cn("size-3 shrink-0 rounded-full", colorDot[service.color])}
                aria-hidden="true"
              />

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold text-foreground">
                  {service.name}
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Tipo */}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      service.maxGroupSize
                        ? "bg-primary-soft text-accent-foreground"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {service.maxGroupSize ? (
                      <>
                        <Users className="size-3" aria-hidden="true" />
                        Grupo · até {service.maxGroupSize} pessoas
                      </>
                    ) : (
                      <>
                        <User className="size-3" aria-hidden="true" />
                        Individual
                      </>
                    )}
                  </span>

                  {/* Duração */}
                  {service.durationMinutes > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3" aria-hidden="true" />
                      {formatDuration(service.durationMinutes)}
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Editar */}
              <button
                type="button"
                aria-label={`Editar ${service.name}`}
                onClick={() => setEditState({ mode: "edit", service })}
                className="ml-auto shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <Pencil className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Adicionar novo */}
      <button
        type="button"
        onClick={() => setEditState({ mode: "new" })}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary-soft px-4 py-3 text-sm font-semibold text-primary transition-colors hover:border-primary hover:bg-primary/10"
      >
        <Plus className="size-4" aria-hidden="true" />
        Novo serviço
      </button>
    </div>
  )
}
