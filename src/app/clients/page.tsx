'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  PhoneIcon,
  BanknotesIcon,
  DocumentTextIcon,
  TrashIcon,
  PencilIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

// Definição das interfaces para tipagem
interface Client {
  id: number;
  nome: string;
  cpf: string;
  status: string;
  telefone?: string;
  banco: string;
  descricao?: string;
  user: { email: string };
  dataNascimento: string;
  createdAt: string;
  updatedAt: string;
  valorDisponivel: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const { token, logout, user, isAdmin } = useAuthStore();
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    createdStartDate: '',
    createdEndDate: '',
    cpf: '',
    nome: '',
    status: '',
    banco: '',
  });

  // Função para buscar clientes na API com filtros
  const fetchClients = async () => {
    try {
      const url = new URL(`/api/clients`, window.location.origin);
      url.searchParams.set('page', pagination.page.toString());
      url.searchParams.set('limit', pagination.limit.toString());

      if (filters.startDate) url.searchParams.set('startDate', filters.startDate);
      if (filters.endDate) url.searchParams.set('endDate', filters.endDate);
      if (filters.createdStartDate) url.searchParams.set('createdStartDate', filters.createdStartDate);
      if (filters.createdEndDate) url.searchParams.set('createdEndDate', filters.createdEndDate);
      if (filters.cpf) url.searchParams.set('cpf', filters.cpf);
      if (filters.nome) url.searchParams.set('nome', filters.nome);
      if (filters.status) url.searchParams.set('status', filters.status);
      if (filters.banco) url.searchParams.set('banco', filters.banco);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao carregar clientes (Status: ${response.status})`);
      }

      const data = await response.json();
      setClients(data.data || []);
      setPagination({
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      });
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      setClients([]);
      if (error instanceof Error) {
        alert(error.message);
      }
    }
  };

  // Carrega os clientes ao montar o componente ou quando os filtros/paginação mudam
  useEffect(() => {
    if (token) {
      fetchClients();
    } else {
      router.push('/login');
    }
  }, [token, pagination.page, pagination.limit, filters]);

  // Função para logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

const handleDelete = async (clientId: number) => {
  if (!confirm('Tem certeza que deseja excluir este cliente?')) return;
  try {
    const response = await fetch(`/api/clients/${clientId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      let errorMessage = 'Erro ao excluir cliente';
      // Verificar se a resposta é JSON antes de tentar parseá-la
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorMessage;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    setClients(clients.filter((client) => client.id !== clientId));
    alert('Cliente excluído com sucesso!');
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    alert(error instanceof Error ? error.message : 'Erro ao excluir cliente. Tente novamente.');
  }
};

  // Função para aplicar filtros
  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchClients();
  };

  return (
    <div className="container mx-auto p-4">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
        
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-sm text-gray-500">Usuário: {user?.email}</p>
        </div>
        <div className="flex gap-4">
        <button
      onClick={() => router.push('/')}
      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 mr-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
      Voltar
    </button>
          <button
            onClick={() => router.push('/clients/create')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Novo Cliente
          </button>
          {isAdmin() && (
            <button
              onClick={() => router.push('/export')}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Exportar
            </button>
          )}
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Formulário de Filtros */}
      <form onSubmit={handleFilter} className="mb-6 p-4 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Nascimento (Início)</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Nascimento (Fim)</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Criação (Início)</label>
            <input
              type="date"
              value={filters.createdStartDate}
              onChange={(e) => setFilters({ ...filters, createdStartDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Data de Criação (Fim)</label>
            <input
              type="date"
              value={filters.createdEndDate}
              onChange={(e) => setFilters({ ...filters, createdEndDate: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">CPF</label>
            <input
              type="text"
              value={filters.cpf}
              onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Digite o CPF"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome</label>
            <input
              type="text"
              value={filters.nome}
              onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Digite o nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <input
              type="text"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Digite o status"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Banco</label>
            <input
              type="text"
              value={filters.banco}
              onChange={(e) => setFilters({ ...filters, banco: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              placeholder="Digite o banco"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Filtrar
          </button>
        </div>
      </form>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div key={client.id} className="bg-white p-4 rounded-lg shadow-md relative">
              <div className="absolute top-2 right-2 flex gap-2">
                <button
                  onClick={() => router.push(`/clients/${client.id}`)}
                  className="bg-blue-500 text-white p-1 rounded"
                  title="Visualizar"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => router.push(`/clients/update/${client.id}`)}
                  className="bg-yellow-500 text-white p-1 rounded"
                  title="Editar"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                {isAdmin() && (
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="bg-red-500 text-white p-1 rounded"
                    title="Excluir"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>
              <h3 className="font-bold text-lg flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                {client.nome}
              </h3>
              <p className="text-gray-600 flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2" />
                CPF: {client.cpf}
              </p>
              <p className="text-gray-600 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Data de Nascimento: {new Date(client.dataNascimento).toLocaleDateString()}
              </p>
              <p className="text-gray-600 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Telefone: {client.telefone || 'Não informado'}
              </p>
              <p className="text-gray-600 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Banco: {client.banco}
              </p>
              <p className="text-gray-600 flex items-center">
                <BanknotesIcon className="h-5 w-5 mr-2" />
                Valor Disponível: {client.valorDisponivel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-gray-600 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Status: {client.status}
              </p>
              <p className="text-gray-600 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Descrição: {client.descricao || 'Não informada'}
              </p>
              <p className="text-gray-500 text-sm mt-2 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                {new Date(client.updatedAt) > new Date(client.createdAt) ? (
                  `Atualizado em: ${new Date(client.updatedAt).toLocaleDateString()}`
                ) : (
                  `Criado em: ${new Date(client.createdAt).toLocaleDateString()}`
                )}
              </p>
              <p className="text-gray-500 text-sm flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Criado por: {client.user.email}
              </p>
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
        )}
      </div>

      {/* Paginação */}
      <div className="mt-6 flex justify-between items-center">
        <select
          value={pagination.limit}
          onChange={(e) =>
            setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))
          }
          className="border p-2 rounded"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size} por página
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: i + 1 }))}
              className={`px-3 py-1 rounded ${
                pagination.page === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}