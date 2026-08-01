# Camada de API — Floua Frontend

## Visão geral

```
lib/
  api/
    client.ts          — fetch wrapper, token store, ApiError
    auth.ts            — login, logout, refresh, getMe
    appointments.ts    — agendamentos, horários livres, bloqueios
    customers.ts       — clientes e summaries
    services.ts        — serviços, horários de atendimento, grades fixas
    finance.ts         — cobranças, PIX, inadimplência, resumo financeiro
    assistant.ts       — eventos da assistente, métricas do dashboard
    index.ts           — barrel de exportações
  hooks/
    use-appointments.ts
    use-customers.ts
    use-services.ts
    use-finance.ts
    use-assistant.ts
    index.ts
```

## Modo mock vs API real

A constante `IS_MOCK` em `client.ts` é `true` quando `NEXT_PUBLIC_API_URL` não está definida.
Cada função da camada de API verifica `IS_MOCK` antes de fazer fetch — se verdadeiro, importa
o mock local e retorna os dados estáticos. Quando o backend estiver pronto:

1. Adicionar `NEXT_PUBLIC_API_URL=https://api.assistpro.app` no `.env.local`
2. Nenhum componente ou hook precisa mudar

## Contrato com o backend NestJS

| Frontend (`lib/api/`) | Rota NestJS             | Método | Auth |
|-----------------------|-------------------------|--------|------|
| `login()`             | `POST /auth/login`      | POST   | —    |
| `refreshToken()`      | `POST /auth/refresh`    | POST   | cookie httpOnly |
| `logout()`            | `POST /auth/logout`     | POST   | Bearer |
| `getMe()`             | `GET /auth/me`          | GET    | Bearer |
| `listAppointments()`  | `GET /appointments`     | GET    | Bearer |
| `createAppointment()` | `POST /appointments`    | POST   | Bearer |
| `listFreeSlots()`     | `GET /appointments/free-slots` | GET | Bearer |
| `shareSlots()`        | `POST /appointments/share-slots` | POST | Bearer |
| `listBlockedSlots()`  | `GET /appointments/blocked-slots` | GET | Bearer |
| `createBlockedSlot()` | `POST /appointments/blocked-slots` | POST | Bearer |
| `listCustomers()`     | `GET /customers`        | GET    | Bearer |
| `createCustomer()`    | `POST /customers`       | POST   | Bearer |
| `updateCustomer()`    | `PATCH /customers/:id`  | PATCH  | Bearer |
| `listServices()`      | `GET /services`         | GET    | Bearer |
| `createService()`     | `POST /services`        | POST   | Bearer |
| `getBusinessHours()`  | `GET /settings/business-hours` | GET | Bearer |
| `saveBusinessHours()` | `PUT /settings/business-hours` | PUT | Bearer |
| `listRecurringSchedules()` | `GET /schedules`   | GET    | Bearer |
| `createRecurringSchedule()` | `POST /schedules` | POST  | Bearer |
| `getPublicSchedule()` | `GET /public/schedules/:id` | GET | — |
| `listCharges()`       | `GET /finance/charges`  | GET    | Bearer |
| `createCharge()`      | `POST /finance/charges` | POST   | Bearer |
| `registerPayment()`   | `POST /finance/charges/register-payment` | POST | Bearer |
| `getPixCharge()`      | `GET /finance/charges/:id/pix` | GET | Bearer |
| `getFinanceSummary()` | `GET /finance/summary`  | GET    | Bearer |
| `listOverdueBalances()` | `GET /finance/overdue` | GET   | Bearer |
| `listAssistantEvents()` | `GET /assistant/events` | GET  | Bearer |
| `dismissAssistantEvent()` | `DELETE /assistant/events/:id` | DELETE | Bearer |
| `getDashboardMetrics()` | `GET /assistant/metrics` | GET  | Bearer |

## Tratamento de erros

Todos os erros HTTP lançam `ApiError` com `status`, `code` e `message`.
Espera-se que o NestJS retorne `{ code: string, message: string }` no body de erros.

## Autenticação

- `accessToken` fica em memória (variável de módulo em `client.ts`) — nunca em localStorage.
- `refreshToken` fica em cookie `httpOnly` gerenciado pelo servidor.
- Quando o servidor retorna 401, o interceptor deve chamar `refreshToken()` e retentar.
  Isso ainda não está implementado — será adicionado quando o backend estiver disponível.
