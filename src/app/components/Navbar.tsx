// src/app/components/Navbar.tsx
'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/clients" className="text-xl font-bold text-gray-800">
              JBC
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/clients" className="text-gray-600 hover:text-blue-500">
              Clientes
            </Link>
            {isAdmin() && (
              <Link href="/export" className="text-gray-600 hover:text-blue-500">
                Exportar
              </Link>
            )}
            <div className="flex items-center gap-2">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
