import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        draft: "badge-draft",
        sent: "badge-sent",
        answered: "badge-answered",
        pending: "badge-pending",
        closed: "badge-closed",
        overdue: "badge-overdue",
        default: "bg-[var(--background-muted)] text-[var(--foreground-muted)]",
        primary: "bg-[var(--primary)] text-[var(--primary-foreground)]",
        accent: "bg-[var(--accent)] text-[var(--accent-foreground)]",
        success: "bg-emerald-50 text-emerald-700",
        warning: "bg-amber-50 text-amber-700",
        danger: "bg-red-50 text-red-700",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
