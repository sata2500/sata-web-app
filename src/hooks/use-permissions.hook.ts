// src/hooks/use-permissions.hook.ts
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { Permission, hasPermission, getUserPermissions } from '@/lib/permissions';

export function usePermissions() {
  const { userProfile, loading } = useAuth(); // 'user' değişkenini kaldırdık
  const [permissions, setPermissions] = useState<Permission[]>([]);
  
  useEffect(() => {
    if (!loading && userProfile) {
      setPermissions(getUserPermissions(userProfile));
    } else {
      setPermissions([]);
    }
  }, [userProfile, loading]);
  
  const checkPermission = (permission: Permission): boolean => {
    if (loading) return false;
    return hasPermission(userProfile, permission);
  };
  
  const canAccessAdmin = (): boolean => {
    return checkPermission(Permission.ADMIN_ACCESS);
  };
  
  return {
    permissions,
    hasPermission: checkPermission,
    canAccessAdmin,
    isLoading: loading
  };
}