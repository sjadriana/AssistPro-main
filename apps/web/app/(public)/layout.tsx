/**
 * Layout público — sem sidebar, sem autenticação.
 * Usado pela rota /remarcar/[token] (e futuras rotas públicas).
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
