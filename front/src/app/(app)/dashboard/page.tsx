import { Header } from "@/components/organisms/header"
import { Button } from "@/components/atoms/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/molecules/card"
import { Badge } from "@/components/atoms/badge"
import {
  FileText,
  Users,
  Clock,
  TrendingDown,
  Plus,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"

const kpis = [
  {
    label: "Cotizaciones activas",
    value: "7",
    change: "+2 esta semana",
    icon: FileText,
    color: "text-[var(--primary)]",
    bg: "bg-[var(--background-muted)]",
  },
  {
    label: "Respuestas pendientes",
    value: "14",
    change: "3 vencen hoy",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    label: "Proveedores activos",
    value: "23",
    change: "+1 este mes",
    icon: Users,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    label: "Ahorro estimado",
    value: "$4.2M",
    change: "vs. precio lista",
    icon: TrendingDown,
    color: "text-[var(--primary)]",
    bg: "bg-sky-50",
  },
]

const recentRFQs = [
  {
    id: "RFQ-024",
    title: "Papelería y suministros Q2",
    suppliers: 4,
    answered: 2,
    status: "pending" as const,
    deadline: "Vence en 2 días",
  },
  {
    id: "RFQ-023",
    title: "Equipos de cómputo – área IT",
    suppliers: 6,
    answered: 6,
    status: "answered" as const,
    deadline: "Cerrado hoy",
  },
  {
    id: "RFQ-022",
    title: "Servicios de limpieza mensual",
    suppliers: 3,
    answered: 1,
    status: "sent" as const,
    deadline: "Vence en 5 días",
  },
  {
    id: "RFQ-021",
    title: "Mantenimiento HVAC edificio A",
    suppliers: 2,
    answered: 0,
    status: "overdue" as const,
    deadline: "Venció ayer",
  },
]

const statusLabel: Record<string, string> = {
  draft:    "Borrador",
  sent:     "Enviada",
  pending:  "Parcial",
  answered: "Completa",
  closed:   "Cerrada",
  overdue:  "Vencida",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <Header
        title="Dashboard"
        action={
          <Button asChild size="sm">
            <Link href="/rfq/new">
              <Plus className="h-3.5 w-3.5" />
              Nueva cotización
            </Link>
          </Button>
        }
      />

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map((kpi) => (
            <Card key={kpi.label}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-[var(--foreground-muted)]">
                      {kpi.label}
                    </p>
                    <p
                      className="mt-1 text-2xl font-bold tabular-nums text-[var(--foreground)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {kpi.value}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--foreground-faint)]">
                      {kpi.change}
                    </p>
                  </div>
                  <div className={`rounded-lg p-2 ${kpi.bg}`}>
                    <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent RFQs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Solicitudes recientes</CardTitle>
                <CardDescription>Tus últimas cotizaciones activas</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/rfq">
                  Ver todas
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="divide-y divide-[var(--border)]">
              {recentRFQs.map((rfq) => (
                <li key={rfq.id}>
                  <Link
                    href={`/rfq/${rfq.id}`}
                    className="flex items-center justify-between py-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 text-xs font-mono text-[var(--foreground-faint)]">
                        {rfq.id}
                      </span>
                      <span className="truncate text-sm font-medium text-[var(--foreground)]">
                        {rfq.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 ml-4">
                      <span className="text-xs text-[var(--foreground-muted)]">
                        {rfq.answered}/{rfq.suppliers} resp.
                      </span>
                      <span className="text-xs text-[var(--foreground-faint)]">
                        {rfq.deadline}
                      </span>
                      <Badge variant={rfq.status}>
                        {statusLabel[rfq.status]}
                      </Badge>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
