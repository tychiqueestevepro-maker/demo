import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 text-sm font-semibold transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-neutral-950 text-white shadow-sm hover:bg-neutral-800",
        secondary: "border border-neutral-200 bg-white text-neutral-900 shadow-sm hover:bg-neutral-50",
        ghost: "text-neutral-700 hover:bg-neutral-100",
        accent: "bg-violet-600 text-white shadow-sm hover:bg-violet-700",
        subtle: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

