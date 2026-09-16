import React from "react";
import { cn } from "../../lib/utils";

export const ShimmerButton = React.forwardRef(function ShimmerButton(
  {
    shimmerColor = "#ffffff",
    shimmerSize = "0.05em",
    shimmerDuration = "3s",
    borderRadius = "100px",
    background = "rgba(6, 78, 59, 1)",
    className,
    children,
    ...props
  },
  ref
) {
  return (
    <button
      style={{
        "--spread": "90deg",
        "--shimmer-color": shimmerColor,
        "--radius": borderRadius,
        "--speed": shimmerDuration,
        "--cut": shimmerSize,
        "--bg": background,
      }}
      className={cn(
        "group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap border border-emerald-300/20 px-6 py-3 text-white [background:var(--bg)] [border-radius:var(--radius)]",
        "transform-gpu transition-transform duration-300 ease-in-out active:translate-y-px",
        className
      )}
      ref={ref}
      {...props}
    >
      <div className="-z-30 absolute inset-0 overflow-visible blur-[2px]">
        <div className="animate-shimmer-slide absolute inset-0 aspect-square h-full">
          <div className="animate-spin-around absolute -inset-full w-auto bg-[conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))]" />
        </div>
      </div>
      {children}
      <div className="absolute inset-0 size-full rounded-2xl shadow-[inset_0_-8px_10px_#ffffff1f] transition-all duration-300 group-hover:shadow-[inset_0_-6px_10px_#ffffff3f] group-active:shadow-[inset_0_-10px_10px_#ffffff3f]" />
      <div className="absolute inset-[var(--cut)] -z-20 [background:var(--bg)] [border-radius:var(--radius)]" />
    </button>
  );
});
