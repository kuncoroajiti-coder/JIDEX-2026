import type { ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "accent";

type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-jidex-navy text-white shadow-[var(--jidex-shadow-sm)] hover:bg-[#0f213d]",
  secondary:
    "bg-jidex-surface-blue text-jidex-navy hover:bg-jidex-blue-light",
  outline:
    "border border-jidex-border bg-transparent text-jidex-navy hover:bg-jidex-surface",
  ghost:
    "bg-transparent text-jidex-navy hover:bg-jidex-surface",
  accent:
    "bg-jidex-orange text-white shadow-[var(--jidex-shadow-sm)] hover:brightness-95",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-full",
        "font-medium tracking-[-0.01em]",
        "transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jidex-blue focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        "active:scale-[0.98]",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    />
  );
}
