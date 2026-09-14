import type { HTMLAttributes } from "react";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  muted?: boolean;
}

export function Section({
  muted = false,
  className = "",
  children,
  ...props
}: SectionProps) {
  return (
    <section
      className={[
        "section-jidex",
        muted ? "bg-jidex-surface" : "bg-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </section>
  );
}
