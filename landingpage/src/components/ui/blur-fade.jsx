import { useRef } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";

export function BlurFade({
  children,
  className,
  duration = 0.5,
  delay = 0,
  offset = 12,
  direction = "up",
  inView = true,
  inViewMargin = "-60px",
  blur = "8px",
  ...props
}) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const start = direction === "right" || direction === "down" ? -offset : offset;
  const variants = {
    hidden: { [axis]: start, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={variants}
        transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
