import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF5A1F] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#FF5A1F] text-white shadow-sm",
        secondary: "border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-[var(--text-primary)] hover:border-[#FF5A1F]/40",
        destructive: "border-transparent bg-[#E53935]/20 text-[#E53935] border border-[#E53935]/30 font-mono",
        outline: "text-[var(--text-primary)] border-[var(--border-subtle)] bg-[var(--bg-card)]",
        success: "border-transparent bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 font-mono font-bold",
        warning: "border-transparent bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30 font-mono font-bold",
        info: "border-transparent bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30 font-mono font-bold",
        online: "border-transparent bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 animate-pulse font-mono font-bold",
        offline: "border-transparent bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)] font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
