/**
 * Hooks SWR por domínio.
 *
 * Convenções:
 * - Cada hook retorna { data, isLoading, error, mutate }.
 * - As keys SWR são strings prefixadas por domínio (ex: "appointments").
 * - Mutations chamam a função da lib/api e depois mutate() para revalidar.
 * - Enquanto IS_MOCK=true, os fetchers retornam os mocks — sem diferença de API.
 */

export * from "./use-appointments"
export * from "./use-customers"
export * from "./use-services"
export * from "./use-finance"
export * from "./use-assistant"
