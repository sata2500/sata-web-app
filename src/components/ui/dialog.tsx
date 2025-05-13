// src/components/ui/dialog.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

// Context ve hook tanımlamaları
interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('Dialog bileşenleri bir Dialog içinde kullanılmalıdır');
  }
  return context;
};

// Bileşen prop tipleri
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface DialogContentProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogHeaderProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogFooterProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogTitleProps {
  className?: string;
  children: React.ReactNode;
}

interface DialogDescriptionProps {
  className?: string;
  children: React.ReactNode;
}

// Bileşen implementasyonları
const Dialog: React.FC<DialogProps> = ({
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  children,
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  
  const open = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const onOpenChange = controlledOnOpenChange || setUncontrolledOpen;

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children }) => {
  const { onOpenChange } = useDialog();
  
  return (
    <button
      type="button"
      onClick={() => onOpenChange(true)}
    >
      {children}
    </button>
  );
};

const DialogPortal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

const DialogOverlay: React.FC<{ className?: string }> = ({ className }) => {
  const { open, onOpenChange } = useDialog();
  
  if (!open) return null;
  
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className
      )}
      onClick={() => onOpenChange(false)}
    />
  );
};

const DialogContent: React.FC<DialogContentProps> = ({
  className,
  children,
}) => {
  const { open } = useDialog();
  
  if (!open) return null;
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <div
        className={cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
          'rounded-lg',
          className
        )}
        role="dialog"
        aria-modal="true"
      >
        {children}
        <DialogClose />
      </div>
    </DialogPortal>
  );
};

const DialogClose: React.FC = () => {
  const { onOpenChange } = useDialog();
  
  return (
    <button
      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
      onClick={() => onOpenChange(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24">
        <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 6L6 18M6 6l12 12" />
      </svg>
      <span className="sr-only">Kapat</span>
    </button>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center sm:text-left',
        className
      )}
    >
      {children}
    </div>
  );
};

const DialogFooter: React.FC<DialogFooterProps> = ({
  className,
  children,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2',
        className
      )}
    >
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({
  className,
  children,
}) => {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
    >
      {children}
    </h2>
  );
};

const DialogDescription: React.FC<DialogDescriptionProps> = ({
  className,
  children,
}) => {
  return (
    <p className={cn('text-sm text-muted-foreground', className)}>
      {children}
    </p>
  );
};

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};