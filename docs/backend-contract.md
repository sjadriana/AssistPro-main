# AssistPro — Contrato de Backend

> Documento gerado a partir do frontend completo.
> Cada endpoint listado aqui já possui um mock funcional no frontend.
> Quando o backend estiver pronto, basta apontar `NEXT_PUBLIC_API_URL` para a API e os mocks são ignorados automaticamente.

---

## Convenções globais

### Autenticação
- Todos os endpoints privados exigem `Authorization: Bearer <accessToken>`.
- O `accessToken` tem validade curta (15 min sugerido).
- O `refreshToken` deve ser enviado em cookie `httpOnly`, nunca no body.
- Endpoints públicos (prefixo `/public/`) não exigem token.
- Endpoints de booking (prefixo `/booking/`) autenticam via `rescheduleToken` na URL.

### Formato de resposta
```
Content-Type: application/json
```

### Erros
```json
{
  "code": "APPOINTMENT_NOT_FOUND",
  "message": "Agendamento não encontrado.",
  "statusCode": 404
}
```

### Tipos base
| Tipo | Formato |
|---|---|
| `UUID` | string UUID v7 |
| `ISODateTime` | string UTC ISO 8601 (`2024-05-22T10:00:00.000Z`) |
| `ISODate` | string `YYYY-MM-DD` |
| `TimeString` | string `HH:mm` |
| `Cents` | number inteiro (centavos) |

### Soft delete
Entidades com `deletedAt` nunca devem ser retornadas em listagens normais.
Retornar apenas quando explicitamente filtrado.

---

## 1. Auth — `/auth`

### POST /auth/login
Autentica o profissional.

**Body**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "UUID",
    "name": "string",
    "email": "string",
    "avatarUrl": "string | null",
    "role": "OWNER | PROFESSIONAL | ASSISTANT",
    "plan": "ESSENCIAL | PROFISSIONAL | PREMIUM",
    "segment": "TENIS | PERSONAL | AULA_PARTICULAR | SALAO | CLINICA | PET_SHOP",
    "createdAt": "ISODateTime",
    "updatedAt": "ISODateTime"
  }
}
```

**Regras**
- `refreshToken` retornado no body **e** em cookie `httpOnly; Secure; SameSite=Lax`.
- Senhas hashadas com bcrypt (custo >= 12).
- Máximo 5 tentativas por IP por minuto (rate limit).
- Retornar 401 com `code: "INVALID_CREDENTIALS"` sem informar qual campo está errado.

---

### POST /auth/refresh
Renova o `accessToken` usando o `refreshToken` do cookie.

**Response 200** — mesmo shape de `/auth/login`.

**Regras**
- Lê o `refreshToken` do cookie `httpOnly`.
- Se expirado ou revogado, retornar 401 `code: "REFRESH_TOKEN_EXPIRED"`.
- Rotacionar o `refreshToken` a cada refresh (refresh token rotation).

---

### POST /auth/logout
Invalida o `refreshToken` no servidor.

**Response 204**

**Regras**
- Apagar o `refreshToken` da whitelist/banco.
- Limpar o cookie.

---

### GET /auth/me
Retorna o perfil do usuário autenticado.

**Response 200** — objeto `User` (mesmo shape acima, sem tokens).

---

## 2. Customers — `/customers`

### GET /customers
Lista clientes do profissional autenticado.

**Query params**
| Param | Tipo | Descrição |
|---|---|---|
| `query` | string | Busca por nome, telefone ou e-mail (LIKE %query%) |
| `status` | `ATIVO \| INATIVO \| PENDENTE` | Filtro por status |
| `page` | number | Default: 1 |
| `pageSize` | number | Default: 20, máx: 100 |

**Response 200**
```json
{
  "items": [CustomerSummary],
  "total": 42,
  "page": 1,
  "pageSize": 20
}
```

**CustomerSummary**
```json
{
  "id": "UUID",
  "name": "string",
  "phone": "string",
  "avatarUrl": "string | null",
  "status": "ATIVO | INATIVO | PENDENTE",
  "lastAppointmentAt": "ISODateTime | null"
}
```

---

### GET /customers/:id
Retorna um cliente completo com histórico de preferências.

**Response 200 — Customer**
```json
{
  "id": "UUID",
  "name": "string",
  "phone": "string",
  "email": "string | null",
  "birthDate": "ISODate | null",
  "address": "string | null",
  "avatarUrl": "string | null",
  "status": "ATIVO | INATIVO | PENDENTE",
  "notes": "string | null",
  "preferences": {
    "preferredServiceId": "UUID | null",
    "preferredServiceName": "string | null",
    "preferredPeriod": "MANHA | TARDE | NOITE | null",
    "availableDays": ["SEG","TER","QUA","QUI","SEX","SAB","DOM"]
  },
  "customFields": [
    { "key": "string", "label": "string", "value": "string" }
  ],
  "lastAppointmentAt": "ISODateTime | null",
  "createdAt": "ISODateTime",
  "updatedAt": "ISODateTime",
  "deletedAt": "ISODateTime | null"
}
```

---

### POST /customers
Cria um novo cliente.

**Body** — todos os campos do Customer exceto `id`, `createdAt`, `updatedAt`, `deletedAt`, `lastAppointmentAt`.

**Regras**
- `phone` deve ser único por profissional.
- Normalizar telefone: remover caracteres não numéricos, armazenar com DDI (ex: `5511999991111`).
- `email` deve ser válido se informado.
- `status` default: `"ATIVO"`.
- `customFields` default: `[]`.

**Response 201** — objeto `Customer` completo.

---

### PATCH /customers/:id
Atualiza campos de um cliente. Apenas os campos enviados são alterados.

**Response 200** — objeto `Customer` atualizado.

---

### DELETE /customers/:id
Soft-delete do cliente.

**Response 204**

**Regras**
- Não deletar se houver agendamentos futuros ativos. Retornar 409 `code: "CUSTOMER_HAS_FUTURE_APPOINTMENTS"`.
- Não deletar se houver cobranças `PENDENTE` em aberto. Retornar 409 `code: "CUSTOMER_HAS_OPEN_CHARGES"`.

---

### GET /customers/:id/appointments
Lista os agendamentos de um cliente específico.

**Response 200** — array de `Appointment` (ver seção 3).

---

### GET /customers/:id/charges
Lista as cobranças de um cliente específico.

**Response 200** — array de `Charge` (ver seção 5).

---

## 3. Appointments — `/appointments`

### GET /appointments
Lista agendamentos do profissional.

**Query params**
| Param | Tipo | Descrição |
|---|---|---|
| `status` | `AppointmentStatus` | Filtro por status |
| `date` | `ISODate` | Filtra por data exata |
| `customerId` | UUID | Filtra por cliente |
| `from` | `ISODate` | Data inicial do intervalo |
| `to` | `ISODate` | Data final do intervalo |
| `query` | string | Busca por nome do cliente |

**Response 200** — array de `Appointment`.

**Appointment**
```json
{
  "id": "UUID",
  "customerId": "UUID",
  "customerName": "string",
  "serviceId": "UUID",
  "serviceName": "string",
  "startsAt": "ISODateTime",
  "endsAt": "ISODateTime",
  "status": "CONFIRMADO | AGUARDANDO | CANCELADO | CONCLUIDO | LIVRE",
  "mode": "PRESENCIAL | ONLINE | DOMICILIAR",
  "meetingUrl": "string | null",
  "address": "string | null",
  "notes": "string | null",
  "reminders": {
    "sendConfirmationNow": true,
    "remind24hBefore": true,
    "remind30minBefore": false
  },
  "sessionType": "INDIVIDUAL | GRUPO",
  "groupParticipants": [
    { "customerId": "UUID", "customerName": "string" }
  ],
  "rescheduleToken": "string | null",
  "createdAt": "ISODateTime",
  "updatedAt": "ISODateTime",
  "deletedAt": "ISODateTime | null"
}
```

---

### POST /appointments
Cria um ou mais agendamentos (um por data selecionada).

**Body**
```json
{
  "customerId": "UUID",
  "serviceId": "UUID",
  "dates": ["YYYY-MM-DD"],
  "startTime": "HH:mm",
  "mode": "PRESENCIAL | ONLINE | DOMICILIAR",
  "recurrence": "SEMANAL | QUINZENAL | MENSAL | null",
  "meetingUrl": "string | null",
  "address": "string | null",
  "notes": "string | null",
  "reminders": {
    "sendConfirmationNow": true,
    "remind24hBefore": true,
    "remind30minBefore": false
  },
  "sessionType": "INDIVIDUAL | GRUPO",
  "groupParticipants": [
    { "customerId": "UUID", "customerName": "string" }
  ]
}
```

**Regras**
- Para cada data em `dates`, criar um `Appointment` independente.
- `endsAt` = `startsAt` + `service.durationMinutes`.
- Verificar conflito de horário (o profissional não pode ter dois atendimentos sobrepostos). Retornar 409 `code: "TIME_CONFLICT"` com a lista dos conflitantes.
- Verificar se o horário está dentro de `BusinessHours`. Retornar 422 `code: "OUTSIDE_BUSINESS_HOURS"`.
- Verificar se o horário não está em `BlockedSlot`. Retornar 422 `code: "SLOT_BLOCKED"`.
- `status` inicial: `"AGUARDANDO"` se `reminders.sendConfirmationNow = true`, senão `"CONFIRMADO"`.
- Se `recurrence` for informada, criar os atendimentos recorrentes pelo período de 3 meses a partir da primeira data, respeitando todas as mesmas validações.
- Se `reminders.sendConfirmationNow = true`, enfileirar mensagem de confirmação via WhatsApp.
- Gerar `rescheduleToken` para cada agendamento criado (formato: `apt-{id}-{timestamp-base64url}`).
- `sessionType = "GRUPO"`: validar `groupParticipants.length >= 2` e que o `service.maxGroupSize` não é ultrapassado.

**Response 201** — array de `Appointment` criados.

---

### PATCH /appointments/:id/status
Atualiza o status de um agendamento.

**Body**
```json
{ "status": "CONFIRMADO | AGUARDANDO | CANCELADO | CONCLUIDO" }
```

**Regras**
- Transições válidas:
  - `AGUARDANDO` → `CONFIRMADO`, `CANCELADO`
  - `CONFIRMADO` → `CONCLUIDO`, `CANCELADO`
  - `CANCELADO` → não permite mais transições
  - `CONCLUIDO` → não permite mais transições
- Se mudar para `CANCELADO` e houver cobrança `PENDENTE` vinculada, retornar aviso (não bloquear).
- Se mudar para `CONCLUIDO` e não houver cobrança, emitir evento `COBRANCA_PENDENTE` para a assistente.

**Response 200** — `Appointment` atualizado.

---

### DELETE /appointments/:id
Soft-delete / cancelamento definitivo.

**Response 204**

---

### GET /appointments/free-slots
Lista horários livres nos próximos N dias para oferecer ao cliente.

**Query params**
| Param | Tipo | Default |
|---|---|---|
| `days` | number | 7 |
| `slotMinutes` | number | 60 |

**Regras**
- Calcular slots dentro do `BusinessHours` do profissional.
- Subtrair slots ocupados por `Appointments` ativos e `BlockedSlots`.
- Retornar apenas datas futuras.

**Response 200**
```json
[
  {
    "id": "string",
    "date": "YYYY-MM-DD",
    "startsAt": "ISODateTime",
    "endsAt": "ISODateTime"
  }
]
```

---

### POST /appointments/share-slots
Envia horários livres selecionados para um cliente via WhatsApp.

**Body**
```json
{
  "customerId": "UUID",
  "slotIds": ["string"]
}
```

**Regras**
- Montar a mensagem com o template `HORARIOS_LIVRES`.
- Enfileirar o envio via WhatsApp.
- Registrar o envio em `WhatsAppMessage`.

**Response 204**

---

### GET /appointments/blocked-slots
Lista os bloqueios de agenda.

**Response 200** — array de `BlockedSlot`.

```json
{
  "id": "UUID",
  "startsAt": "ISODateTime",
  "endsAt": "ISODateTime",
  "allDay": true,
  "reason": "string | null",
  "createdAt": "ISODateTime",
  "updatedAt": "ISODateTime",
  "deletedAt": "ISODateTime | null"
}
```

---

### POST /appointments/blocked-slots
Cria um bloqueio de agenda.

**Body**
```json
{
  "startsAt": "ISODateTime",
  "endsAt": "ISODateTime",
  "allDay": false,
  "reason": "string | null"
}
```

**Regras**
- `endsAt` deve ser posterior a `startsAt`.
- Se `allDay = true`, normalizar `startsAt` para 00:00 e `endsAt` para 23:59 do mesmo dia.
- Cancelar (não deletar) agendamentos que estejam dentro do bloqueio? Não automático — avisar o profissional com a lista dos conflitantes no response.

**Response 201** — `BlockedSlot`.

---

### DELETE /appointments/blocked-slots/:id
Remove um bloqueio.

**Response 204**

---

## 4. Services — `/services`

### GET /services
Lista todos os serviços do profissional.

**Response 200**
```json
[
  {
    "id": "UUID",
    "name": "string",
    "durationMinutes": 60,
    "price": 15000,
    "color": "violet | emerald | amber | rose | sky",
    "active": true,
    "maxGroupSize": "number | null",
    "createdAt": "ISODateTime",
    "updatedAt": "ISODateTime",
    "deletedAt": "ISODateTime | null"
  }
]
```

---

### POST /services
Cria um serviço.

**Body** — campos do `Service` exceto `id`, `createdAt`, `updatedAt`, `deletedAt`.

**Regras**
- `name` único por profissional.
- `durationMinutes` mínimo: 15.
- `price` em centavos, mínimo: 0.
- `active` default: `true`.
- `maxGroupSize` null = apenas individual.

**Response 201** — `Service`.

---

### PATCH /services/:id
Atualiza um serviço.

**Response 200** — `Service` atualizado.

---

### DELETE /services/:id
Soft-delete.

**Regras**
- Não deletar se houver agendamentos futuros usando este serviço. Retornar 409 `code: "SERVICE_HAS_FUTURE_APPOINTMENTS"`.

**Response 204**

---

## 5. Finance — `/finance`

### GET /finance/charges
Lista cobranças.

**Query params**
| Param | Tipo | Descrição |
|---|---|---|
| `period` | `ESTE_MES \| MES_PASSADO \| ULTIMOS_7_DIAS` | Filtro de período |
| `status` | `PAGO \| PENDENTE \| ATRASADO \| CANCELADO` | Filtro de status |
| `customerId` | UUID | Filtro por cliente |

**Response 200** — array de `Charge`.

**Charge**
```json
{
  "id": "UUID",
  "customerId": "UUID",
  "customerName": "string",
  "description": "string",
  "dueDate": "ISODate",
  "amount": 15000,
  "status": "PAGO | PENDENTE | ATRASADO | CANCELADO",
  "method": "PIX | BOLETO | DINHEIRO | CARTAO | TRANSFERENCIA | null",
  "paidAt": "ISODate | null",
  "billingType": "PIX | BOLETO | CARTAO_CREDITO | null",
  "origin": "AVULSA | ATENDIMENTO",
  "invoiceUrl": "string | null",
  "gatewayId": "string | null",
  "appointmentId": "UUID | null",
  "createdAt": "ISODateTime",
  "updatedAt": "ISODateTime",
  "deletedAt": "ISODateTime | null"
}
```

---

### POST /finance/charges
Cria uma nova cobrança.

**Body**
```json
{
  "customerId": "UUID",
  "description": "string",
  "amount": 15000,
  "dueDate": "ISODate",
  "billingType": "PIX | BOLETO | CARTAO_CREDITO",
  "appointmentId": "UUID | null",
  "recurring": false,
  "sendWhatsAppNow": true
}
```

**Regras**
- `amount` mínimo: 1 centavo.
- `dueDate` deve ser igual ou posterior à data atual.
- Se `billingType` for `PIX` ou `BOLETO`, criar cobrança no gateway (Asaas) e armazenar `gatewayId` e `invoiceUrl`.
- Se `recurring = true`, criar cobranças mensais para os próximos 12 meses, todas vinculadas ao mesmo cliente e descrição, com `dueDate` incrementado por mês no mesmo dia.
- Se `sendWhatsAppNow = true`, enfileirar mensagem com template `COBRANCA`.
- `status` inicial: `"PENDENTE"`.
- `origin`: `"ATENDIMENTO"` se `appointmentId` informado, senão `"AVULSA"`.

**Response 201** — `Charge` (ou array quando `recurring = true`).

---

### POST /finance/charges/register-payment
Registra pagamento manual de uma cobrança (sem gateway).

**Body**
```json
{
  "chargeId": "UUID",
  "method": "DINHEIRO | CARTAO | TRANSFERENCIA | PIX",
  "paidAt": "ISODate"
}
```

**Regras**
- Só pode registrar em cobranças com status `PENDENTE` ou `ATRASADO`.
- Atualizar `status` para `"PAGO"`, `paidAt` e `method`.
- `paidAt` não pode ser data futura.

**Response 200** — `Charge` atualizada.

---

### DELETE /finance/charges/:id
Cancela uma cobrança.

**Regras**
- Só pode cancelar cobranças `PENDENTE` ou `ATRASADO`.
- Se tiver `gatewayId`, cancelar no gateway também.
- Soft-delete: atualizar `status` para `"CANCELADO"` e `deletedAt`.

**Response 204**

---

### GET /finance/summary
Retorna o resumo financeiro do período.

**Query params**
| Param | Tipo |
|---|---|
| `period` | `ESTE_MES \| MES_PASSADO \| ULTIMOS_7_DIAS` |

**Response 200**
```json
{
  "expected": 150000,
  "received": 80000,
  "pending": 70000,
  "changeVsPreviousPeriod": 12.5
}
```

**Regras**
- `expected` = soma de cobranças `PAGO + PENDENTE + ATRASADO` do período.
- `received` = soma de cobranças `PAGO` do período.
- `pending` = soma de cobranças `PENDENTE + ATRASADO` do período.
- `changeVsPreviousPeriod` = variação percentual de `expected` em relação ao período anterior.

---

### GET /finance/charges/:id/pix
Retorna o payload PIX de uma cobrança.

**Regras**
- Cobrança deve ter `billingType = "PIX"`.
- Consultar o gateway pelo `gatewayId` para obter o `pixPayload` atualizado.
- `expiresAt` = `dueDate` + 24h em UTC.

**Response 200**
```json
{
  "chargeId": "UUID",
  "payload": "string",
  "amount": 15000,
  "expiresAt": "ISODateTime"
}
```

---

### GET /finance/overdue
Lista clientes com saldo em aberto, agrupados por cliente.

**Response 200**
```json
[
  {
    "customerId": "UUID",
    "customerName": "string",
    "phone": "string",
    "totalOpen": 35000,
    "charges": [Charge],
    "oldestDueDate": "ISODate",
    "daysLate": 37,
    "hasOverdue": true
  }
]
```

**Regras**
- Incluir apenas cobranças `PENDENTE` e `ATRASADO`.
- Atualizar automaticamente o status de `PENDENTE` para `ATRASADO` quando `dueDate < today`.
- `daysLate` = diferença em dias entre `today` e `oldestDueDate` (0 se não venceu).
- Ordenar por `daysLate` decrescente.

---

## 6. Settings — `/settings`

### GET /settings/business-hours
Retorna os horários de atendimento do profissional.

**Response 200**
```json
[
  {
    "weekday": "SEG | TER | QUA | QUI | SEX | SAB | DOM",
    "enabled": true,
    "from": "07:00",
    "to": "18:00"
  }
]
```

**Regras**
- Sempre retornar os 7 dias da semana, mesmo os desabilitados.
- Na criação da conta, inicializar com Seg–Sex habilitados, 07:00–18:00.

---

### PUT /settings/business-hours
Salva os horários de atendimento.

**Body** — array de `BusinessHours` (todos os 7 dias).

**Regras**
- `from` deve ser anterior a `to`.
- Não pode haver sobreposição entre os horários do mesmo dia.

**Response 200** — array de `BusinessHours` salvo.

---

### GET /settings/profile
Retorna o perfil do profissional (nome, email, avatar, plano, segmento).

**Response 200** — objeto `User`.

---

### PATCH /settings/profile
Atualiza dados do perfil.

**Body** (todos opcionais)
```json
{
  "name": "string",
  "email": "string",
  "avatarUrl": "string | null",
  "segment": "TENIS | PERSONAL | AULA_PARTICULAR | SALAO | CLINICA | PET_SHOP"
}
```

**Response 200** — `User` atualizado.

---

### PATCH /settings/password
Troca a senha do profissional.

**Body**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Regras**
- Verificar `currentPassword` antes de aceitar a troca.
- `newPassword` mínimo 8 caracteres.
- Invalidar todos os `refreshTokens` ativos do usuário após a troca.

**Response 204**

---

## 7. Schedules (Grades Fixas) — `/schedules`

### GET /schedules
Lista grades fixas do profissional.

**Response 200** — array de `RecurringSchedule`.

**RecurringSchedule**
```json
{
  "id": "UUID",
  "serviceId": "UUID",
  "serviceName": "string",
  "weekdays": ["SEG","QUA","SEX"],
  "startTime": "07:00",
  "endTime": "08:00",
  "maxParticipants": 6,
  "active": true,
  "mode": "PRESENCIAL | ONLINE",
  "address": "string | null",
  "meetingUrl": "string | null",
  "shareUrl": "string",
  "createdAt": "ISODateTime",
  "updatedAt": "ISODateTime"
}
```

**Regras**
- `shareUrl` = URL pública da vitrine de agendamento: `https://app.assistpro.com/agendar/{id}`.

---

### POST /schedules
Cria uma grade fixa.

**Body** — campos do `RecurringSchedule` exceto `id`, `createdAt`, `updatedAt`, `shareUrl`, `serviceName`.

**Regras**
- `startTime` deve ser anterior a `endTime`.
- `maxParticipants` mínimo: 1.
- Validar que o `serviceId` pertence ao profissional e está ativo.
- `active` default: `true`.
- Se `mode = "ONLINE"` e `meetingUrl` for nulo, aceitar — o profissional pode preencher depois.

**Response 201** — `RecurringSchedule`.

---

### PATCH /schedules/:id
Atualiza uma grade fixa.

**Response 200** — `RecurringSchedule` atualizado.

---

### DELETE /schedules/:id
Remove uma grade fixa.

**Response 204**

---

### PATCH /schedules/:id/toggle
Ativa ou desativa uma grade sem editar os outros campos.

**Body**
```json
{ "active": true }
```

**Response 200** — `RecurringSchedule`.

---

## 8. Messaging / WhatsApp — `/messaging`

### GET /messaging/messages
Lista o histórico de mensagens enviadas.

**Query params**
| Param | Tipo |
|---|---|
| `customerId` | UUID (opcional) |
| `status` | `MessageStatus` (opcional) |

**Response 200** — array de `WhatsAppMessage`.

**WhatsAppMessage**
```json
{
  "id": "UUID",
  "customerId": "UUID",
  "customerName": "string",
  "phone": "string",
  "templateId": "WhatsAppTemplateId",
  "body": "string",
  "status": "AGENDADO | ENVIADO | ENTREGUE | LIDO | FALHOU",
  "sentAt": "ISODateTime",
  "chargeId": "UUID | null",
  "appointmentId": "UUID | null",
  "failureReason": "string | null"
}
```

---

### POST /messaging/send
Envia uma mensagem manual para um cliente.

**Body**
```json
{
  "customerId": "UUID",
  "templateId": "WhatsAppTemplateId",
  "body": "string",
  "chargeId": "UUID | null",
  "appointmentId": "UUID | null"
}
```

**Regras**
- `body` é o texto final já com as variáveis substituídas.
- Enfileirar o envio no worker de WhatsApp.
- Registrar o envio com `status: "AGENDADO"` imediatamente.
- Atualizar o status (`ENVIADO`, `ENTREGUE`, `LIDO`, `FALHOU`) via webhook do provedor.

**Response 201** — `WhatsAppMessage`.

---

### GET /messaging/templates
Lista os templates de mensagem disponíveis.

**Response 200** — array de `WhatsAppTemplate`.

---

### PATCH /messaging/templates/:id
Atualiza o corpo de um template.

**Body**
```json
{ "body": "string" }
```

**Regras**
- Apenas o campo `body` pode ser alterado — `id` e `variables` são imutáveis.
- Validar que o `body` contém apenas variáveis declaradas em `variables`.

**Response 200** — `WhatsAppTemplate`.

---

### GET /messaging/automations
Lista as automações configuradas.

**Response 200** — array de `Automation`.

---

### PATCH /messaging/automations/:id
Habilita ou desabilita uma automação.

**Body**
```json
{ "enabled": true }
```

**Response 200** — `Automation`.

---

### GET /messaging/billing-automation
Retorna a configuração da régua de cobrança automática.

**Response 200**
```json
{
  "dayOfMonth": 30,
  "sendAt": "09:00",
  "enabled": true,
  "createdAt": "ISODateTime",
  "updatedAt": "ISODateTime"
}
```

---

### PATCH /messaging/billing-automation
Atualiza a configuração da régua de cobrança.

**Body**
```json
{
  "dayOfMonth": 30,
  "sendAt": "09:00",
  "enabled": true
}
```

**Regras**
- `dayOfMonth` entre 1 e 28 (evitar problemas com fevereiro).
- Reprogramar o cron job no worker ao salvar.

**Response 200** — configuração atualizada.

---

## 9. Assistant / Dashboard — `/assistant`

### GET /assistant/events
Retorna os eventos gerados pela assistente (feed do dashboard).

**Query params**
| Param | Tipo | Default |
|---|---|---|
| `limit` | number | 10 |
| `unreadOnly` | boolean | false |

**Response 200** — array de `AssistantEvent`.

**AssistantEvent**
```json
{
  "id": "UUID",
  "kind": "CONFIRMACAO_RECEBIDA | CANCELAMENTO | PAGAMENTO_PENDENTE | REAGENDAMENTO_SOLICITADO | CLIENTE_INATIVO | RETORNO_SUGERIDO | COBRANCA_PENDENTE",
  "message": "string",
  "detail": "string | null",
  "createdAt": "ISODateTime",
  "customerId": "UUID | null",
  "suggestedAction": {
    "label": "string",
    "href": "string"
  }
}
```

**Regras — geração de eventos (workers/cron)**
| Evento | Gatilho |
|---|---|
| `CONFIRMACAO_RECEBIDA` | Cliente responde confirmar via WhatsApp |
| `CANCELAMENTO` | Status de appointment muda para `CANCELADO` |
| `PAGAMENTO_PENDENTE` | Cobrança vence e continua `PENDENTE` |
| `REAGENDAMENTO_SOLICITADO` | Cliente acessa link de reagendamento |
| `CLIENTE_INATIVO` | Cliente sem agendamento há > 30 dias |
| `RETORNO_SUGERIDO` | Assistente detecta padrão de retorno (ex: mensal) |
| `COBRANCA_PENDENTE` | Appointment concluído sem cobrança vinculada |

---

### GET /assistant/dashboard
Retorna as métricas do dashboard.

**Response 200**
```json
{
  "appointmentsToday": 4,
  "awaitingConfirmation": 2,
  "pendingPayments": 7,
  "freeSlots": 3,
  "revenueThisMonth": 480000
}
```

**Regras**
- `appointmentsToday` = appointments com `startsAt` em UTC hoje, status != `CANCELADO`.
- `awaitingConfirmation` = appointments com status `AGUARDANDO`.
- `pendingPayments` = cobranças com status `PENDENTE` ou `ATRASADO`.
- `freeSlots` = slots livres calculados para o dia atual.
- `revenueThisMonth` = soma de cobranças `PAGO` no mês corrente.

---

## 10. Booking (Vitrine pública) — `/public` e `/booking`

### GET /public/schedules/:scheduleId
Retorna dados públicos de uma grade fixa para exibição na vitrine de agendamento.

**Autenticação** — nenhuma.

**Response 200** — `RecurringSchedule` (sem campos sensíveis do profissional).

---

### GET /public/schedules/:scheduleId/slots
Retorna os próximos slots disponíveis de uma grade pública.

**Query params**
| Param | Tipo | Default |
|---|---|---|
| `weeks` | number | 2 |

**Response 200**
```json
[
  {
    "date": "YYYY-MM-DD",
    "weekday": "SEG",
    "startTime": "07:00",
    "endTime": "08:00",
    "spotsLeft": 4
  }
]
```

**Regras**
- `spotsLeft` = `maxParticipants` - participantes já inscritos naquele slot.
- Não retornar slots com `spotsLeft <= 0`.
- Não retornar datas passadas.

---

### POST /public/schedules/:scheduleId/join
Cliente se inscreve em um slot de grade pública.

**Autenticação** — nenhuma (cliente se identifica pelo formulário).

**Body**
```json
{
  "name": "string",
  "phone": "string",
  "email": "string | null",
  "date": "YYYY-MM-DD"
}
```

**Regras**
- Buscar ou criar o `Customer` pelo `phone`.
- Verificar `spotsLeft > 0` antes de criar o appointment.
- Criar o `Appointment` com status `"AGUARDANDO"`.
- Enfileirar mensagem de confirmação para o cliente.
- Emitir evento `CONFIRMACAO_RECEBIDA` para o profissional.

**Response 201** — `Appointment`.

---

### GET /booking/reschedule/:token
Retorna os dados do agendamento para a tela de reagendamento.

**Autenticação** — token na URL.

**Regras**
- Validar que o `rescheduleToken` existe e não está expirado (token válido por 7 dias).
- Retornar o appointment original e os slots disponíveis para nova data.

**Response 200**
```json
{
  "appointment": Appointment,
  "availableSlots": [FreeSlot]
}
```

---

### POST /booking/reschedule/:token
Confirma o reagendamento escolhido pelo cliente.

**Body**
```json
{
  "newStartsAt": "ISODateTime"
}
```

**Regras**
- Validar token.
- Verificar disponibilidade do novo horário (sem conflitos).
- Atualizar `startsAt` e `endsAt` do appointment.
- Invalidar o `rescheduleToken` após o uso.
- Emitir evento `REAGENDAMENTO_SOLICITADO` para o profissional.
- Enfileirar mensagem de confirmação do novo horário para o cliente.

**Response 200** — `Appointment` atualizado.

---

## 11. Erros padronizados

| Code | Status | Descrição |
|---|---|---|
| `INVALID_CREDENTIALS` | 401 | Email ou senha incorretos |
| `REFRESH_TOKEN_EXPIRED` | 401 | Token de refresh expirado ou revogado |
| `UNAUTHORIZED` | 401 | Token ausente ou inválido |
| `FORBIDDEN` | 403 | Recurso não pertence ao profissional autenticado |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `TIME_CONFLICT` | 409 | Conflito de horário ao criar agendamento |
| `CUSTOMER_HAS_FUTURE_APPOINTMENTS` | 409 | Cliente tem agendamentos futuros |
| `CUSTOMER_HAS_OPEN_CHARGES` | 409 | Cliente tem cobranças em aberto |
| `SERVICE_HAS_FUTURE_APPOINTMENTS` | 409 | Serviço tem agendamentos futuros |
| `OUTSIDE_BUSINESS_HOURS` | 422 | Horário fora do expediente configurado |
| `SLOT_BLOCKED` | 422 | Horário bloqueado na agenda |
| `VALIDATION_ERROR` | 422 | Campos inválidos (retornar array de erros por campo) |
| `GATEWAY_ERROR` | 502 | Falha na comunicação com o gateway de pagamento |

---

## 12. Integração com o frontend

Para ativar o backend real no frontend, basta definir a variável de ambiente:

```
NEXT_PUBLIC_API_URL=https://api.seudominio.com
```

Enquanto essa variável não estiver definida, todos os dados vêm dos mocks locais e o app funciona sem backend. Os contratos acima espelham exatamente o que está implementado em `apps/web/lib/api/`.
