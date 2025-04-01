// src/app/history/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  PhoneIcon,
  CurrencyDollarIcon,
  ClipboardDocumentIcon,
  BanknotesIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface HistoryEntry {
  id: number;
  clientId: number;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  user: { email: string };
  client: { nome: string; cpf: string };
  createdAt: string;
}

// Mapa de ícones para cada campo
const fieldIcons: { [key: string]: React.ComponentType<any> } = {
  cpf: IdentificationIcon,
  nome: UserIcon,
  dataNascimento: CalendarIcon,
  telefone: PhoneIcon,
  valorDisponivel: CurrencyDollarIcon,
  status: ClipboardDocumentIcon,
  banco: BanknotesIcon,
  descricao: DocumentTextIcon,
};

// Função para gerar uma cor única com base no email do usuário
const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(Math.abs((Math.sin(hash) * 10000) % 1) * 16777216).toString(16);
  return '#' + ('000000' + color).slice(-6);
};

export default function HistoryPage() {
  const router = useRouter();
  const { user, token, logout } = useAuthStore();
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  // Verifica autenticação e permissões ao carregar a página
  useEffect(() => {
    if (!token || !user || user.role !== 'admin') {
      router.push('/login');
      return;
    }

    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Erro ao carregar histórico');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Erro ao buscar histórico:', error);
      }
    };

    fetchHistory();
  }, [token, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho */}
      <header className="bg-gray-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Histórico de Alterações</h1>
          <nav className="flex space-x-4 items-center">
            <button
              onClick={() => router.push('/')}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-500 transition-colors"
            >
              Sair
            </button>
          </nav>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Registros de Alterações</h2>
        {history.length > 0 ? (
          <ul className="space-y-6">
            {history.map((entry) => {
              const Icon = fieldIcons[entry.field] || UserIcon; // Ícone padrão caso o campo não esteja no mapa
              const userColor = stringToColor(entry.user.email); // Gera uma cor única para o usuário
              return (
                <li
                  key={entry.id}
                  className="p-6 bg-white rounded-xl shadow-md flex items-start space-x-4 hover:shadow-lg transition-shadow"
                >
                  {/* Ícone do campo */}
                  <div className="flex-shrink-0">
                    <Icon className="h-8 w-8 text-blue-500" />
                  </div>

                  {/* Detalhes da alteração */}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Cliente:</span> {entry.client.nome} (CPF:{' '}
                      {entry.client.cpf})
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Campo Alterado:</span> {entry.field}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Valor Antigo:</span>{' '}
                      <span className="text-red-600">{entry.oldValue || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Valor Novo:</span>{' '}
                      <span className="text-green-600">{entry.newValue || 'N/A'}</span>
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold text-gray-900">Alterado por:</span>{' '}
                      <span
                        className="inline-block px-3 py-1 rounded-full text-white text-xs font-medium"
                        style={{ backgroundColor: userColor }}
                      >
                        {entry.user.email}
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold text-gray-900">Data da Alteração:</span>{' '}
                      {new Date(entry.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-600 text-lg">Nenhum registro de alteração encontrado.</p>
        )}
      </main>
    </div>
  );
}