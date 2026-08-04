import type { Metadata } from "next"
import { LandingHeader } from "./_components/landing-header"
import { LandingFooter } from "./_components/landing-footer"
import { Hero } from "./_sections/hero"
import { Problems } from "./_sections/problems"
import { Solution } from "./_sections/solution"
import { Features } from "./_sections/features"
import { Comparison } from "./_sections/comparison"
import { Testimonials } from "./_sections/testimonials"
import { HowItWorks } from "./_sections/how-it-works"
import { Mission } from "./_sections/mission"
import { Pricing } from "./_sections/pricing"
import { FAQ } from "./_sections/faq"
import { CTA } from "./_sections/cta"

export const metadata: Metadata = {
  title: "Floua — Agenda, WhatsApp e cobrança automática para profissionais autônomos",
  description:
    "Pare de perder tempo com agenda e cobranças. O Floua automatiza confirmações, lembretes e cobranças pelo WhatsApp para personal trainers, professores de tênis, fisioterapeutas, terapeutas e qualquer profissional autônomo.",
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main>
        <Hero />
        <Problems />
        <Solution />
        <Features />
        <Comparison />
        {/* <Testimonials /> Temporarily disabled until we have real testimonials */} 
        <HowItWorks />
        <Mission />
        <Pricing />
        <FAQ />
        <CTA />
      </main>
      <LandingFooter />
    </div>
  )
}
