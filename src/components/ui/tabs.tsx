// src/components/ui/tabs.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

// Context ve hook tanımlamaları
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs bileşenleri bir Tabs içinde kullanılmalıdır');
  }
  return context;
};

// Bileşen prop tipleri
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

// Bileşen implementasyonları
const Tabs: React.FC<TabsProps> = ({
  defaultValue,
  value,
  onValueChange,
  className,
  children,
}) => {
  const [tabValue, setTabValue] = useState(value || defaultValue);

  const handleValueChange = (newValue: string) => {
    if (value === undefined) {
      setTabValue(newValue);
    }
    onValueChange?.(newValue);
  };

  return (
    <TabsContext.Provider
      value={{ value: value || tabValue, onValueChange: handleValueChange }}
    >
      <div className={cn('space-y-4', className)}>{children}</div>
    </TabsContext.Provider>
  );
};

const TabsList: React.FC<TabsListProps> = ({ className, children }) => {
  return (
    <div
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  );
};

const TabsTrigger: React.FC<TabsTriggerProps> = ({
  value,
  className,
  children,
}) => {
  const { value: selectedValue, onValueChange } = useTabs();
  const isSelected = selectedValue === value;

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      data-state={isSelected ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isSelected
          ? 'bg-background text-foreground shadow-sm'
          : 'hover:bg-background/50',
        className
      )}
    >
      {children}
    </button>
  );
};

const TabsContent: React.FC<TabsContentProps> = ({
  value,
  className,
  children,
}) => {
  const { value: selectedValue } = useTabs();
  const isSelected = selectedValue === value;

  if (!isSelected) return null;

  return (
    <div
      role="tabpanel"
      data-state={isSelected ? 'active' : 'inactive'}
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        className
      )}
    >
      {children}
    </div>
  );
};

export { Tabs, TabsList, TabsTrigger, TabsContent };