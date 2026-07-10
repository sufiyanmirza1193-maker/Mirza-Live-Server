import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[#FF5A1F] text-white hover:bg-[#FF5A1F]/90 shadow-lg shadow-[#FF5A1F]/20 hover:shadow-[#FF5A1F]/30",
        destructive: "bg-[#E53935] text-white hover:bg-[#E53935]/90 shadow-lg shadow-[#E53935]/20",
        outline: "border border-[#1C1C1C] bg-[#111111]/80 hover:bg-[#1C1C1C] hover:text-white backdrop-blur-sm",
        secondary: "bg-[#1C1C1C] text-[#F5F5F5] hover:bg-[#262626]",
        ghost: "hover:bg-[#1C1C1C] hover:text-white",
        link: "text-[#FF5A1F] underline-offset-4 hover:underline",
        glow: "bg-gradient-to-r from-[#FF5A1F] to-[#E53935] text-white hover:opacity-95 shadow-xl shadow-[#FF5A1F]/25",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-6 text-base font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
