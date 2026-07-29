import type { AsaasChargeResponse, BillingType, CreateChargeInput, ISODate } from "@assistpro/types"

/**
 * Cliente do Asaas — HOJE 100% SIMULADO.
 *
 * Nenhuma requisição sai da aplicação: as contas de integração ainda não existem.
 * O formato dos payloads e das respostas segue a API real do Asaas justamente
 * para que a virada seja localizada neste arquivo.
 *
 * PARA LIGAR DE VERDADE, quando a conta estiver criada:
 *   1. Trocar `ASAAS_MOCK` por `!process.env.ASAAS_API_KEY`.
 *   2. Mover estas funções para uma Route Handler ou Server Action — a chave
 *      NUNCA pode ir para o cliente.
 *   3. Substituir os blocos `if (ASAAS_MOCK)` por `fetch` em
 *      `https://api.asaas.com/v3/payments`, com o header `access_token`.
 *   4. Criar/anexar o customer do Asaas antes da cobrança e guardar o
 *      `gatewayCustomerId` em `Customer`.
 *   5. Tratar o webhook de `PAYMENT_RECEIVED` para marcar a cobrança como paga
 *      sem depender de registro manual.
 *
 * Enquanto `mocked` vier `true`, toda tela que exibir link de pagamento deve
 * avisar que a cobrança é simulada.
 */
const ASAAS_MOCK = true

/** Latência curta só para o botão exibir estado de carregamento de forma crível. */
const SIMULATED_LATENCY_MS = 420

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function randomId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export const billingTypeLabels: Record<BillingType, string> = {
  PIX: "PIX",
  BOLETO: "Boleto",
  CARTAO_CREDITO: "Cartão de crédito",
}

/** Payload que será enviado ao Asaas — exposto para depuração e testes. */
export function buildChargePayload(input: CreateChargeInput, gatewayCustomerId: string) {
  return {
    customer: gatewayCustomerId,
    billingType: input.billingType,
    value: input.amount / 100,
    dueDate: input.dueDate,
    description: input.description,
    externalReference: input.appointmentId ?? undefined,
  }
}

export async function createCharge(
  input: CreateChargeInput,
  options: { gatewayCustomerId?: string; pixPayload?: string } = {},
): Promise<AsaasChargeResponse> {
  if (ASAAS_MOCK) {
    await wait(SIMULATED_LATENCY_MS)

    const id = randomId("pay")

    return {
      id,
      status: "PENDING",
      dueDate: input.dueDate,
      value: input.amount / 100,
      // O sandbox do Asaas usa exatamente este formato de URL de fatura.
      invoiceUrl: `https://sandbox.asaas.com/i/${id}`,
      bankSlipUrl: input.billingType === "BOLETO" ? `https://sandbox.asaas.com/b/pdf/${id}` : null,
      pixPayload: input.billingType === "PIX" ? (options.pixPayload ?? null) : null,
      mocked: true,
    }
  }

  throw new Error("Integração real do Asaas ainda não configurada.")
}

export async function getCharge(gatewayId: string, dueDate: ISODate): Promise<AsaasChargeResponse> {
  if (ASAAS_MOCK) {
    await wait(SIMULATED_LATENCY_MS)

    return {
      id: gatewayId,
      status: "PENDING",
      dueDate,
      value: 0,
      invoiceUrl: `https://sandbox.asaas.com/i/${gatewayId}`,
      bankSlipUrl: null,
      pixPayload: null,
      mocked: true,
    }
  }

  throw new Error("Integração real do Asaas ainda não configurada.")
}

/** A interface consulta isto para decidir se mostra o aviso de simulação. */
export const asaasIsMocked = ASAAS_MOCK
