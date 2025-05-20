import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-success text-success-foreground shadow-xs disabled:opacity-100",
        pending: "bg-muted text-muted-foreground shadow-xs disabled:opacity-100",
        info: "bg-info text-info-foreground shadow-xs",
        warning: "bg-warning text-warning-foreground shadow-xs",
        input:
          "font-normal justify-start bg-card border-input placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground flex  min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

function SubmitButton({
  status = "idle",
  children,
  ...props
}: React.ComponentProps<typeof Button> & {
  status?: "idle" | "pending" | "success" | "warning";
  children?: React.ReactNode;
}) {
  const submitVariant =
    status === "success" ? "success" : status === "pending" ? "pending" : status === "warning" ? "warning" : "default";

  const disabled = status === "pending" || status === "success";

  let buttonContent: React.ReactNode;

  switch (status) {
    case "pending":
      buttonContent = <Loader2 className="size-4 animate-spin" />;
      break;
    case "success":
      buttonContent = <CheckCircle className="size-4" />;
      break;
    case "warning":
      buttonContent = <AlertTriangle className="size-4" />;
      break;
    case "idle":
    default:
      buttonContent = children;
      break;
  }

  return (
    <Button type="submit" variant={submitVariant} disabled={disabled} {...props}>
      {buttonContent}
    </Button>
  );
}

export { Button, buttonVariants, SubmitButton };
