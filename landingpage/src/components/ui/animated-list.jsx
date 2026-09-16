import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../lib/utils";

export function AnimatedListItem({ children }) {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1, originY: 0 }}
      exit={{ scale: 0.92, opacity: 0 }}
      transition={{ type: "spring", stiffness: 350, damping: 40 }}
      layout
      className="mx-auto w-full"
    >
      {children}
    </motion.div>
  );
}

export const AnimatedList = React.memo(function AnimatedList({
  children,
  className,
  delay = 1400,
  ...props
}) {
  const [index, setIndex] = useState(0);
  const childrenArray = useMemo(() => React.Children.toArray(children), [children]);

  useEffect(() => {
    if (childrenArray.length === 0) return undefined;
    const timeout = setTimeout(() => {
      setIndex((prev) => (prev + 1) % childrenArray.length);
    }, delay);
    return () => clearTimeout(timeout);
  }, [index, delay, childrenArray.length]);

  const itemsToShow = useMemo(() => {
    const result = [];
    const count = Math.min(4, childrenArray.length);
    for (let i = 0; i < count; i += 1) {
      const itemIndex = (index - i + childrenArray.length) % childrenArray.length;
      result.push(childrenArray[itemIndex]);
    }
    return result;
  }, [index, childrenArray]);

  return (
    <div className={cn("flex flex-col items-center gap-3", className)} {...props}>
      <AnimatePresence initial={false}>
        {itemsToShow.map((item) => (
          <AnimatedListItem key={item.key}>{item}</AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
});
