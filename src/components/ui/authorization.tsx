// src/components/ui/authorization.tsx
'use client';

import { ReactNode } from 'react';
import { Permission } from '@/lib/permissions';
import { usePermissions } from '@/hooks/use-permissions.hook';

interface AuthorizeProps {
  permission: Permission;
  fallback?: ReactNode;
  children: ReactNode;
}

export function Authorize({ permission, fallback = null, children }: AuthorizeProps) {
  const { hasPermission, isLoading } = usePermissions();
  
  // İzinler yükleniyorsa veya yeterli izin yoksa, fallback içeriğini göster
  if (isLoading || !hasPermission(permission)) {
    return <>{fallback}</>;
  }
  
  // İzin varsa, asıl içeriği göster
  return <>{children}</>;
}

interface AdminOnlyProps {
  fallback?: ReactNode;
  children: ReactNode;
}

export function AdminOnly({ fallback = null, children }: AdminOnlyProps) {
  const { canAccessAdmin, isLoading } = usePermissions();
  
  // Admin izni yoksa, fallback içeriğini göster
  if (isLoading || !canAccessAdmin()) {
    return <>{fallback}</>;
  }
  
  // Admin izni varsa, asıl içeriği göster
  return <>{children}</>;
}