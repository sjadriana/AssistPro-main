import { CustomerList } from "@/components/customers/customer-list"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Clientes — assist",
  description: "Cadastro de clientes com contatos, preferências e histórico de atendimentos.",
}

export default function CustomersPage() {
  return <CustomerList />
}
