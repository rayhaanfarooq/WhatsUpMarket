import { memo } from "react";
import { cn } from "../../lib/utils";

export const AuroraText = memo(function AuroraText({
  children,
  className,
  colors = ["#34d399", "#22d3ee", "#818cf8", "#e879f9"],
  speed = 1,
}) {
  const style = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(", ")}, ${colors[0]})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    animationDuration: `${10 / speed}s`,
  };

  return (
    <span className={cn("relative inline-block", className)}>
      <span className="sr-only">{children}</span>
      <span
        className="relative animate-aurora bg-[length:200%_auto] bg-clip-text text-transparent"
        style={style}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  );
});
