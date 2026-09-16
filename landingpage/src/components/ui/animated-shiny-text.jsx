import { cn } from "../../lib/utils";

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) {
  return (
    <span
      style={{ "--shiny-width": `${shimmerWidth}px` }}
      className={cn(
        "mx-auto max-w-md text-zinc-400/80",
        "animate-shiny-text bg-clip-text bg-no-repeat [background-size:var(--shiny-width)_100%] [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]",
        "bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
