import { useEffect, useState } from "react";
import { cn } from "../../lib/utils";

export function Meteors({
  number = 20,
  minDelay = 0.2,
  maxDelay = 1.2,
  minDuration = 2,
  maxDuration = 10,
  angle = 215,
  className,
}) {
  const [styles, setStyles] = useState([]);

  useEffect(() => {
    setStyles(
      Array.from({ length: number }, () => ({
        "--angle": `${-angle}deg`,
        top: "-5%",
        left: `${Math.floor(Math.random() * 100)}%`,
        animationDelay: `${Math.random() * (maxDelay - minDelay) + minDelay}s`,
        animationDuration: `${Math.floor(Math.random() * (maxDuration - minDuration) + minDuration)}s`,
      }))
    );
  }, [number, minDelay, maxDelay, minDuration, maxDuration, angle]);

  return styles.map((style, idx) => (
    <span
      key={idx}
      style={style}
      className={cn(
        "pointer-events-none absolute h-0.5 w-0.5 rotate-[var(--angle)] animate-meteor rounded-full bg-emerald-200 shadow-[0_0_0_1px_#ffffff10]",
        className
      )}
    >
      <span className="pointer-events-none absolute top-1/2 -z-10 h-px w-[60px] -translate-y-1/2 bg-gradient-to-r from-emerald-200/80 to-transparent" />
    </span>
  ));
}
