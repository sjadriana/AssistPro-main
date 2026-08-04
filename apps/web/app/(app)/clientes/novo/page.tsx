import { CustomerForm } from "@/components/customers/customer-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Novo cliente — floua",
  description: "Cadastre um novo cliente com contato, preferências e observações.",
}

export default function NewCustomerPage() {
  return <CustomerForm />
}
