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
  lastModifier?: string | null;
}

interface User {
  id: number;
  email: string;
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
  const [users, setUsers] = useState<User[]>([]); // Lista de vendedores
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 100,
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
    telefone: '', // Novo filtro por telefone
    userId: user?.role === 'admin' ? 'all' : user?.id.toString() || '', // Default para usuário autenticado
  });

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
      if (filters.telefone) url.searchParams.set('telefone', filters.telefone);
      if (filters.userId) url.searchParams.set('userId', filters.userId);

      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ao carregar clientes (Status: ${response.status})`);
      }

      const data = await response.json();
      setClients(data.data || []);
      setUsers(data.users || []); // Define a lista de vendedores
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

  useEffect(() => {
    if (token) {
      fetchClients();
    } else {
      router.push('/login');
    }
  }, [token, pagination.page, pagination.limit, filters]);

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

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchClients();
  };

  return (
    <div className="container mx-auto p-4">
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

      <form onSubmit={handleFilter} className="mb-6 p-6 bg-gray-50 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* CPF */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.cpf}
                onChange={(e) => setFilters({ ...filters, cpf: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="123.456.789-00"
              />
            </div>
          </div>

          {/* Nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.nome}
                onChange={(e) => setFilters({ ...filters, nome: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Status do cliente"
              />
            </div>
          </div>

          {/* Banco */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BanknotesIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.banco}
                onChange={(e) => setFilters({ ...filters, banco: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nome do banco"
              />
            </div>
          </div>

          {/* Telefone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <PhoneIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={filters.telefone}
                onChange={(e) => setFilters({ ...filters, telefone: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          {/* Vendedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de Nascimento (Início) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento (Início)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Data de Nascimento (Fim) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento (Fim)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Data de Criação (Início) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação (Início)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.createdStartDate}
                onChange={(e) => setFilters({ ...filters, createdStartDate: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Data de Criação (Fim) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Criação (Fim)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={filters.createdEndDate}
                onChange={(e) => setFilters({ ...filters, createdEndDate: e.target.value })}
                className="pl-10 pr-4 py-2 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => setFilters({
              startDate: '',
              endDate: '',
              createdStartDate: '',
              createdEndDate: '',
              cpf: '',
              nome: '',
              status: '',
              banco: '',
              telefone: '',
              userId: user?.role === 'admin' ? 'all' : user?.id.toString() || '',
            })}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
          >
            Limpar Filtros
          </button>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Filtrar
          </button>
        </div>
      </form>

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
              {client.lastModifier && (
                <p className="text-gray-500 text-sm flex items-center">
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Última modificação por: {client.lastModifier}
                </p>
              )}
            </div>
          ))
        ) : (
          <p className="text-gray-500">Nenhum cliente encontrado.</p>
        )}
      </div>

      <div className="mt-6 flex justify-between items-center">
        <select
          value={pagination.limit}
          onChange={(e) =>
            setPagination((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))
          }
          className="border p-2 rounded"
        >
          {[100, 200, 500, 1000].map((size) => (
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