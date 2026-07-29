"use client"

import { services } from "@/lib/mock/services"
import type { Weekday } from "@assistpro/types"
import { Card, CardBody, CardHeader, cn, Field, Input, Select, Textarea } from "@assistpro/ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const weekdays: Weekday[] = ["SEG", "TER", "QUA", "QUI", "SEX", "SAB", "DOM"]

export function CustomerForm() {
  const router = useRouter()
  const [availableDays, setAvailableDays] = useState<Weekday[]>(["SEG", "QUA", "SEX"])

  function toggleDay(day: Weekday) {
    setAvailableDays((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    )
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        router.push("/clientes")
      }}
      className="flex max-w-2xl flex-col gap-4"
    >
      <Card>
        <CardHeader title="Dados do cliente" />
        <CardBody className="flex flex-col gap-4">
          <Field label="Nome completo" htmlFor="name">
            <Input id="name" name="name" required placeholder="Ex.: João Silva" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Telefone" htmlFor="phone" hint="Usado para lembretes no WhatsApp.">
              <Input id="phone" name="phone" required inputMode="tel" placeholder="(11) 99999-1111" />
            </Field>

            <Field label="E-mail" htmlFor="email">
              <Input id="email" name="email" type="email" placeholder="cliente@email.com" />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Data de nascimento" htmlFor="birthDate">
              <Input id="birthDate" name="birthDate" type="date" />
            </Field>

            <Field label="Endereço" htmlFor="address">
              <Input id="address" name="address" placeholder="Rua, número" />
            </Field>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Preferências" />
        <CardBody className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Serviço preferido" htmlFor="service">
              <Select id="service" name="service" defaultValue={services[0].id}>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Horário preferido" htmlFor="period">
              <Select id="period" name="period" defaultValue="MANHA">
                <option value="MANHA">Manhã</option>
                <option value="TARDE">Tarde</option>
                <option value="NOITE">Noite</option>
              </Select>
            </Field>
          </div>

          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium text-foreground">Dias disponíveis</legend>
            <div className="flex flex-wrap gap-2">
              {weekdays.map((day) => {
                const selected = availableDays.includes(day)

                return (
                  <button
                    key={day}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "rounded-xl border px-3 py-2 text-xs font-semibold transition-colors",
                      selected
                        ? "border-primary bg-primary-soft text-accent-foreground"
                        : "border-border bg-card text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <Field label="Observações" htmlFor="notes" hint="Anotações visíveis apenas para você.">
            <Textarea id="notes" name="notes" rows={3} placeholder="Ex.: prefere aulas focadas em saque." />
          </Field>
        </CardBody>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/clientes"
          className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-card-foreground transition-colors hover:bg-secondary"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Salvar cliente
        </button>
      </div>
    </form>
  )
}
