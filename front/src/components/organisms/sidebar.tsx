"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  History,
  BarChart3,
  Settings,
  Zap,
} from "lucide-react"

const navItems = [
  {
    group: "Principal",
    items: [
      { href: "/dashboard",   label: "Dashboard",    icon: LayoutDashboard },
      { href: "/rfq",         label: "Cotizaciones",  icon: FileText },
      { href: "/suppliers",   label: "Proveedores",   icon: Users },
    ],
  },
  {
    group: "Análisis",
    items: [
      { href: "/history",     label: "Historial",     icon: History },
      { href: "/reports",     label: "Reportes",      icon: BarChart3 },
    ],
  },
  {
    group: "Cuenta",
    items: [
      { href: "/settings/company", label: "Configuración", icon: Settings },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="flex h-full flex-col border-r border-[var(--border)] bg-[var(--background-card)]"
      style={{ width: "var(--sidebar-width)" }}
    >
      {/* Logo */}
      <div className="flex h-[var(--header-height)] items-center gap-2.5 border-b border-[var(--border)] px-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)]">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span
          className="text-base font-bold tracking-tight text-[var(--foreground)]"
          style={{ fontFamily: "var(--font-display)" }}
        >
          CotizaMe
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {navItems.map((group) => (
          <div key={group.group}>
            <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-[var(--foreground-faint)]">
              {group.group}
            </p>
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active =
                  href === "/dashboard"
                    ? pathname === href
                    : pathname.startsWith(href)
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius)] px-2.5 py-2 text-sm font-medium transition-colors",
                        active
                          ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                          : "text-[var(--foreground-muted)] hover:bg-[var(--background-muted)] hover:text-[var(--foreground)]"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="border-t border-[var(--border)] p-3">
        <div className="flex items-center gap-3 rounded-[var(--radius)] px-2 py-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-xs font-semibold text-white">
            JD
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[var(--foreground)]">Juan Díaz</p>
            <p className="truncate text-xs text-[var(--foreground-faint)]">juan@empresa.co</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
