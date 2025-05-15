"use client"

import * as React from "react"
import { createPortal } from "react-dom"

interface PopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

export const Popover: React.FC<PopoverProps> = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  // Kapalıysa render etme
  if (!open) return null

  // Çocukları render et
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center sm:items-center"
      onClick={() => onOpenChange(false)}
    >
      {children}
    </div>,
    document.body
  )
}

export const PopoverTrigger: React.FC<{
  children: React.ReactNode
  asChild?: boolean
}> = ({ children, asChild }) => {
  return React.cloneElement(
    asChild ? React.Children.only(children) as React.ReactElement : <button>{children}</button>, 
    {
      className: "flex items-center justify-center",
    }
  )
}

export const PopoverContent: React.FC<{
  children: React.ReactNode
  className?: string
  align?: "center" | "start" | "end"
}> = ({ 
  children, 
  className = "", 
  align = "center" 
}) => {
  return (
    <div 
      className={`absolute z-50 mt-2 w-80 rounded-md border bg-background p-4 shadow-md outline-none animate-in fade-in-0 zoom-in-95 ${className}`}
      style={{ 
        top: "100%", 
        ...(align === "center" ? { left: "50%", transform: "translateX(-50%)" } :
            align === "start" ? { left: 0 } : { right: 0 })
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  )
}