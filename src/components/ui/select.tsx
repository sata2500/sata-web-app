// src/components/ui/select.tsx
'use client';

import * as React from 'react';
import { forwardRef, ElementRef, ComponentPropsWithoutRef, createContext, useContext, useState } from 'react';
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

// Context oluşturma
type SelectContextValue = {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  disabled?: boolean;
};

const SelectContext = createContext<SelectContextValue | undefined>(undefined);

function useSelectContext() {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('Select bileşenleri bir Select içinde kullanılmalıdır');
  }
  return context;
}

// Ana Select bileşeni
interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export function Select({ value, onValueChange, disabled = false, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen, disabled }}>
      {children}
    </SelectContext.Provider>
  );
}

// Select Trigger bileşeni
interface SelectTriggerProps extends ComponentPropsWithoutRef<'button'> {
  children: React.ReactNode;
}

export const SelectTrigger = forwardRef<ElementRef<'button'>, SelectTriggerProps>(
  ({ className = '', children, ...props }, ref) => {
    const { open, setOpen, disabled } = useSelectContext();

    return (
      <button
        ref={ref}
        className={`relative flex h-10 w-full items-center justify-between rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        onClick={() => setOpen(!open)}
        disabled={disabled}
        {...props}
      >
        {children}
        <ChevronDownIcon className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

SelectTrigger.displayName = 'SelectTrigger';

// Select Value bileşeni
interface SelectValueProps {
  placeholder?: string;
}

export function SelectValue({ placeholder }: SelectValueProps) {
  const { value } = useSelectContext();
  
  return (
    <span className="block truncate">
      {value ? value : placeholder}
    </span>
  );
}

// Select Content bileşeni
interface SelectContentProps extends ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
}

export function SelectContent({ className = '', children, ...props }: SelectContentProps) {
  const { open, setOpen } = useSelectContext();

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50"
        onClick={() => setOpen(false)}
      />
      <div
        className={`absolute z-50 min-w-[8rem] overflow-hidden rounded-md border border-border bg-card text-card-foreground shadow-md animate-in fade-in-80 mt-1 ${className}`}
        {...props}
      >
        <div className="p-1">{children}</div>
      </div>
    </>
  );
}

// Select Item bileşeni
interface SelectItemProps extends ComponentPropsWithoutRef<'div'> {
  value: string;
  children: React.ReactNode;
}

export function SelectItem({ className = '', value, children, ...props }: SelectItemProps) {
  const { value: selectedValue, onValueChange, setOpen } = useSelectContext();
  const isSelected = selectedValue === value;

  return (
    <div
      className={`relative flex cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-muted focus:bg-muted ${className}`}
      onClick={() => {
        onValueChange(value);
        setOpen(false);
      }}
      {...props}
    >
      <span className="flex-1">{children}</span>
      {isSelected && (
        <CheckIcon className="h-4 w-4 opacity-70" />
      )}
    </div>
  );
}