import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "soft" | "outline";
}

const variants = {
  default: "bg-white shadow-[var(--jidex-shadow-sm)]",
  soft: "bg-jidex-surface-blue",
  outline: "border border-jidex-border bg-white",
};

export function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={[
        "rounded-[var(--jidex-radius-lg)]",
        "transition-shadow duration-200",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}
