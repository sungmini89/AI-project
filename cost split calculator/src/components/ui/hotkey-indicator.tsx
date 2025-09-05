import { cn } from "@/lib/utils"
import { getHotkeyDisplay } from "@/utils/hotkeys"
import { HotkeyConfig } from "@/types/hotkeys"

interface HotkeyIndicatorProps {
  hotkey: HotkeyConfig
  className?: string
  size?: "sm" | "md" | "lg"
}

export function HotkeyIndicator({ hotkey, className, size = "sm" }: HotkeyIndicatorProps) {
  const sizeClasses = {
    sm: "text-xs px-1 py-0.5",
    md: "text-sm px-2 py-1", 
    lg: "text-base px-3 py-1.5"
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded bg-muted font-mono font-medium text-muted-foreground",
        sizeClasses[size],
        className
      )}
      aria-label={`키보드 단축키: ${getHotkeyDisplay(hotkey)}`}
    >
      {getHotkeyDisplay(hotkey)}
    </span>
  )
}

interface HotkeyTooltipProps {
  hotkey: HotkeyConfig
  children: React.ReactNode
  className?: string
}

export function HotkeyTooltip({ hotkey, children, className }: HotkeyTooltipProps) {
  return (
    <div className={cn("group relative", className)}>
      {children}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-black rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-50 whitespace-nowrap">
        {hotkey.description}
        <br />
        <HotkeyIndicator hotkey={hotkey} className="mt-1" />
      </div>
    </div>
  )
}