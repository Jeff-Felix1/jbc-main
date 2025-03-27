// src/app/admin-protected-layout.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/clients'); // Redireciona para uma página padrão se não for admin
    }
  }, [isAuthenticated, isAdmin, router]);

  return <>{children}</>;
}