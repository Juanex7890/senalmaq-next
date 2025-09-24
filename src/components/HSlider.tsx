"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { IconChevronLeft, IconChevronRight } from "@/components/icons";

export interface HSliderProps {
  children: ReactNode;
  step?: number;
  className?: string;
  showArrows?: boolean;
}

const GAP_PX = 12;

export function HSlider({
  children,
  step = 0,
  className,
  showArrows = true,
}: HSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [computedStep, setComputedStep] = useState<number>(240);

  useEffect(() => {
    const element = containerRef.current?.querySelector<HTMLElement>(":scope > *");
    if (!element) {
      return;
    }
    const width = element.getBoundingClientRect().width + GAP_PX;
    if (width > 0) {
      setComputedStep(Math.round(width));
    }
  }, [children]);

  const scrollStep = useMemo(() => (step && step > 0 ? step : computedStep), [step, computedStep]);

  const scrollBy = (delta: number) => {
    containerRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  const wrapperClassName = ["relative", className].filter(Boolean).join(" ");

  return (
    <div className={wrapperClassName}>
      <div
        ref={containerRef}
        className="w-full flex gap-3 overflow-x-auto overflow-y-hidden snap-x snap-mandatory pb-1 [&::-webkit-scrollbar]:hidden"
        style={{
          scrollbarWidth: "none",
          overscrollBehaviorX: "contain",
          WebkitOverflowScrolling: "touch",
          touchAction: "pan-x",
        }}
        onWheel={(event) => {
          if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
            event.currentTarget.scrollLeft += event.deltaY;
            event.preventDefault();
          }
        }}
      >
        {children}
      </div>

      {showArrows && (
        <>
          <button
            type="button"
            aria-label="Anterior"
            onClick={() => scrollBy(-scrollStep)}
            className="hidden sm:flex absolute left-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
          >
            <IconChevronLeft />
          </button>
          <button
            type="button"
            aria-label="Siguiente"
            onClick={() => scrollBy(scrollStep)}
            className="hidden sm:flex absolute right-1 top-1/2 -translate-y-1/2 z-10 h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow hover:bg-white"
          >
            <IconChevronRight />
          </button>
        </>
      )}
    </div>
  );
}

export default HSlider;
