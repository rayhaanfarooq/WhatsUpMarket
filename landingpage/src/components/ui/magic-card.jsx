import { useCallback, useEffect } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import { cn } from "../../lib/utils";

export function MagicCard({
  children,
  className,
  gradientSize = 240,
  gradientColor = "rgba(52, 211, 153, 0.10)",
  gradientFrom = "#34d399",
  gradientTo = "#818cf8",
  background = "#0b0d14",
  border = "rgba(255, 255, 255, 0.08)",
}) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const reset = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [gradientSize, mouseX, mouseY]);

  const handlePointerMove = useCallback(
    (e) => {
      const rect = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - rect.left);
      mouseY.set(e.clientY - rect.top);
    },
    [mouseX, mouseY]
  );

  useEffect(() => {
    reset();
  }, [reset]);

  const borderBackground = useMotionTemplate`
    linear-gradient(${background} 0 0) padding-box,
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientFrom}, ${gradientTo}, ${border} 100%) border-box
  `;
  const spotlight = useMotionTemplate`
    radial-gradient(${gradientSize}px circle at ${mouseX}px ${mouseY}px, ${gradientColor}, transparent 100%)
  `;

  return (
    <motion.div
      className={cn("group relative isolate overflow-hidden border border-transparent", className)}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ background: borderBackground }}
    >
      <motion.div
        className="pointer-events-none absolute inset-px z-10 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: spotlight }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
