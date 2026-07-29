import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  Wallet,
  ClipboardList,
} from "lucide-react"

export const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/atendimentos", label: "Atendimentos", icon: ClipboardList },
  { href: "/financeiro", label: "Financeiro", icon: Wallet },
  { href: "/comunicacoes", label: "Comunicações", icon: MessageSquare },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
  { href: "/configuracoes", label: "Configurações", icon: Settings },
] as const
