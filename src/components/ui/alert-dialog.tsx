// src/components/ui/alert-dialog.tsx
"use client"

import React from "react"
import { createPortal } from "react-dom"

interface AlertDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

const AlertDialog: React.FC<AlertDialogProps> = ({ 
  open, 
  onOpenChange, 
  children 
}) => {
  // Eğer kapalıysa hiçbir şey render etme
  if (!open) return null

  // Portal kullanarak body'e ekle
  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={() => onOpenChange(false)}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div 
        className="z-50 w-full max-w-md p-6 bg-background rounded-lg shadow-lg" 
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  )
}

const AlertDialogTrigger: React.FC<{
  children: React.ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  )
}

const AlertDialogContent: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="grid gap-4">
      {children}
    </div>
  )
}

const AlertDialogHeader: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="flex flex-col space-y-2 text-center sm:text-left">
      {children}
    </div>
  )
}

const AlertDialogFooter: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
      {children}
    </div>
  )
}

const AlertDialogTitle: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  )
}

const AlertDialogDescription: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="text-sm text-muted-foreground">
      {children}
    </div>
  )
}

const AlertDialogAction: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
}> = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${className}`}
    >
      {children}
    </button>
  )
}

const AlertDialogCancel: React.FC<{
  children: React.ReactNode
  onClick?: () => void
  className?: string
}> = ({ children, onClick, className = "" }) => {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring mt-2 sm:mt-0 ${className}`}
    >
      {children}
    </button>
  )
}

export {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}