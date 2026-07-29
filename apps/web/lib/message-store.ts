import type { WhatsAppMessage } from "@assistpro/types"
import { messageHistory } from "./mock/messaging"

/**
 * Histórico de mensagens em memória.
 *
 * Existe para que uma cobrança enviada no Financeiro apareça em Comunicações
 * durante a mesma sessão, sem banco. Recarregar a página volta ao seed — quando
 * a persistência entrar, este módulo é substituído por SWR sobre a API.
 */
let messages: WhatsAppMessage[] = [...messageHistory]

const listeners = new Set<() => void>()

export function getMessages(): WhatsAppMessage[] {
  return messages
}

export function addMessage(message: WhatsAppMessage): void {
  // Mais recentes primeiro, que é a ordem de leitura do histórico.
  messages = [message, ...messages]
  for (const listener of listeners) listener()
}

export function subscribeMessages(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
