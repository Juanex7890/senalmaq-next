"use client";

import type { ReactNode } from "react";

export interface VSliderProps {
  children: ReactNode;
  maxHeight?: string;
  scrollable?: boolean;
  className?: string;
}

export function VSlider({
  children,
  maxHeight = "70vh",
  scrollable = false,
  className,
}: VSliderProps) {
  const baseClass = scrollable
    ? "w-full overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden"
    : "w-full";
  const composedClass = [baseClass, className].filter(Boolean).join(" ");
  const scrollStyle = scrollable
    ? {
        maxHeight,
        scrollbarWidth: "none" as const,
        overscrollBehaviorY: "contain" as const,
        WebkitOverflowScrolling: "touch" as const,
        touchAction: "pan-y" as const,
      }
    : undefined;

  return (
    <div
      className={composedClass}
      style={scrollStyle}
      onWheel={scrollable ? (event) => event.stopPropagation() : undefined}
      onTouchMove={scrollable ? (event) => event.stopPropagation() : undefined}
    >
      {children}
    </div>
  );
}

export default VSlider;
