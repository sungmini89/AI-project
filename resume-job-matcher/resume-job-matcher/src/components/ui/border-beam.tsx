"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] [border:calc(var(--border-width)*1px)_solid_transparent]",

        // mask styles
        "[background:linear-gradient(transparent,transparent),conic-gradient(from_calc(270deg-(var(--anchor)*0.5*1deg)),transparent_0deg,var(--color-from)_var(--anchor)*1deg,var(--color-to)_calc(var(--anchor)*2*1deg),transparent_calc(var(--anchor)*2*1deg))_border-box]",

        // animate the gradient around the border
        "[animation:border-beam_calc(var(--duration)*1s)_infinite_linear_var(--delay)]",

        className,
      )}
    >
      <style>{`
        @keyframes border-beam {
          to {
            --angle: 360deg;
          }
        }
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }
      `}</style>
    </div>
  );
}