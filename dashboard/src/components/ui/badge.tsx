import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#FF5A1F] text-white shadow-sm",
        secondary: "border-transparent bg-[#1C1C1C] text-[#F5F5F5] hover:bg-[#262626]",
        destructive: "border-transparent bg-[#E53935]/20 text-[#E53935] border border-[#E53935]/30",
        outline: "text-[#F5F5F5] border-[#1C1C1C] bg-[#111111]",
        success: "border-transparent bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30",
        warning: "border-transparent bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30",
        info: "border-transparent bg-[#3B82F6]/15 text-[#3B82F6] border border-[#3B82F6]/30",
        online: "border-transparent bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 animate-pulse",
        offline: "border-transparent bg-[#888888]/20 text-[#888888] border border-[#888888]/30",
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
