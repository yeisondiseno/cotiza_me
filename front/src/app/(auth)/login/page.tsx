import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Zap, ArrowRight, Mail, Lock } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Iniciar sesión" }

export default function LoginPage() {
  return (
    <div className="flex min-h-full">
      {/* Left panel — decorative */}
      <div
        className="hidden lg:flex lg:w-[480px] xl:w-[560px] flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: "var(--primary)" }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--primary-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--primary-foreground) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Accent circle */}
        <div
          className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full opacity-20"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute -top-16 -left-16 h-48 w-48 rounded-full opacity-10"
          style={{ background: "var(--accent)" }}
        />

        {/* Logo */}
        <div className="relative flex items-center gap-2.5 z-10">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
            <Zap className="h-4.5 w-4.5 text-white" />
          </div>
          <span
            className="text-lg font-bold text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CotizaMe
          </span>
        </div>

        {/* Claim */}
        <div className="relative z-10">
          <blockquote className="space-y-4">
            <p
              className="text-3xl font-bold leading-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              De 8 horas a 8 minutos.
            </p>
            <p className="text-base text-white/70 leading-relaxed max-w-sm">
              Cotiza con todos tus proveedores en un solo clic. Compara precios, elige el mejor y cierra en minutos.
            </p>
          </blockquote>

          <div className="mt-8 flex gap-8">
            {[
              { value: "4.8×", label: "más rápido" },
              { value: "23%", label: "ahorro promedio" },
              { value: "500+", label: "empresas" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  className="text-2xl font-bold text-white tabular-nums"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {stat.value}
                </p>
                <p className="text-xs text-white/60 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 bg-[var(--background)]">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-lg"
            style={{ background: "var(--primary)" }}
          >
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span
            className="text-base font-bold text-[var(--foreground)]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            CotizaMe
          </span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1
              className="text-2xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Bienvenido de vuelta
            </h1>
            <p className="mt-1.5 text-sm text-[var(--foreground-muted)]">
              Ingresa a tu cuenta para continuar
            </p>
          </div>

          <form className="space-y-4">
            <div>
              <Label htmlFor="email" required>
                Correo electrónico
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-faint)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="juan@empresa.co"
                  autoComplete="email"
                  className="pl-9"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" required>
                  Contraseña
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--primary)] hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--foreground-faint)]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="pl-9"
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg">
              Iniciar sesión
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--foreground-muted)]">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="font-semibold text-[var(--primary)] hover:underline"
            >
              Regístrate gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
