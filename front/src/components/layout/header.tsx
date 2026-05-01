"use client"

import { Bell, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  title?: string
  action?: React.ReactNode
}

export function Header({ title, action }: HeaderProps) {
  return (
    <header
      className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--background-card)] px-6"
      style={{ height: "var(--header-height)" }}
    >
      {/* Left: page title */}
      <div className="flex items-center gap-4">
        {title && (
          <h1
            className="text-base font-semibold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h1>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="icon">
          <Search className="h-4 w-4" />
          <span className="sr-only">Buscar</span>
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {/* Notification dot */}
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          <span className="sr-only">Notificaciones</span>
        </Button>

        {action && <div className="ml-2">{action}</div>}
      </div>
    </header>
  )
}
