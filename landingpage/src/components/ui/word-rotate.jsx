import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/utils";

export function WordRotate({ words, duration = 2500, className }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <span className="inline-flex overflow-hidden align-bottom">
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          className={cn("inline-block", className)}
          initial={{ opacity: 0, y: "-60%", filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: "60%", filter: "blur(6px)" }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
