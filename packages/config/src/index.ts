export const APP_NAME = "assist"
export const APP_TAGLINE = "sua agenda, sua rotina, organizada."
export const APP_POSITIONING = "Sua assistente pessoal para organizar atendimentos."

/** Timezone de exibição. Persistência é sempre UTC (ver seção 4). */
export const DISPLAY_TIMEZONE = "America/Sao_Paulo"

export const CURRENCY = "BRL"
export const LOCALE = "pt-BR"

/** Faixa de horários renderizada na grade da agenda. */
export const AGENDA_START_HOUR = 7
export const AGENDA_END_HOUR = 18

/** Duração padrão de um atendimento, em minutos. */
export const DEFAULT_APPOINTMENT_DURATION = 60

/** Dias sem atendimento após os quais a assistente marca o cliente como inativo. */
export const INACTIVE_CUSTOMER_THRESHOLD_DAYS = 40

export const PLAN_FEATURES = {
  ESSENCIAL: ["Agenda", "Clientes"],
  PROFISSIONAL: ["Agenda", "Clientes", "Financeiro", "WhatsApp"],
  PREMIUM: ["Agenda", "Clientes", "Financeiro", "WhatsApp", "Assistente IA", "Relatórios"],
} as const
