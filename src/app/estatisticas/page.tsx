'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function EstatisticasPage() {
  const { user, token, isAdmin } = useAuthStore();
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (user === undefined) return;

    if (!user || !token) {
      router.push('/login');
    } else if (!isAdmin()) {
      router.push('/clients');
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, token, isAdmin, router]);

  useEffect(() => {
    if (isCheckingAuth) return;

    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();

        const response = await fetch(`/api/estatisticas?month=${month}&year=${year}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao carregar estatísticas');
        }

        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isCheckingAuth, currentDate, token]);

  const handleMonthChange = (increment: number) => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  };

  const chartData = {
    labels: stats.map((s: any) => s.userEmail),
    datasets: [
      {
        label: 'Clientes Cadastrados',
        data: stats.map((s: any) => s.clientCount),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  if (isCheckingAuth) {
    return <p>Verificando autenticação...</p>;
  }
  if (!isAdmin()) {
    return <p>Acesso Negado.</p>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Estatísticas de Vendas</h1>

      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => handleMonthChange(-1)} className="px-4 py-2 bg-gray-200 rounded-md">‹</button>
        <span className="text-xl font-semibold">
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </span>
        <button onClick={() => handleMonthChange(1)} className="px-4 py-2 bg-gray-200 rounded-md">›</button>
      </div>

      {loading && <p>Carregando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <Bar data={chartData} />
      </div>
    </div>
  );
}