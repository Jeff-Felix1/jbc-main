'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import {
  UserIcon,
  IdentificationIcon,
  CalendarIcon,
  PhoneIcon,
  BanknotesIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  CurrencyDollarIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface Client {
  id: number;
  cpf: string;
  nome: string;
  dataNascimento: string;
  valorDisponivel: number;
  status: string;
  telefone?: string;
  banco: string;
  descricao?: string;
  user: { email: string };
  contratos?: any[];
}

export default function UpdateClientPage() {
  const router = useRouter();
  const { id } = useParams();
  const { token, user, isAuthenticated } = useAuthStore();

  const [client, setClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    dataNascimento: '',
    valorDisponivel: '',
    telefone: '',
    status: '',
    banco: '',
    descricao: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Verifica autenticação
  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  // Função para corrigir o formato da data
  const formatDateForInput = (dateString: string) => {
    // Se a data estiver no formato ISO ou similar, vamos garantir que não haja alteração no dia
    if (!dateString) return '';
    
    try {
      // Split the date string to avoid timezone issues
      const parts = dateString.split('T')[0].split('-');
      if (parts.length !== 3) return dateString;
      
      return parts.join('-'); // YYYY-MM-DD format for date input
    } catch (e) {
      console.error("Erro ao formatar data:", e);
      return dateString;
    }
  };

  // Busca os dados do cliente
  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar cliente');
      }

      const data: Client = await response.json();
      setClient(data);
      setFormData({
        cpf: data.cpf,
        nome: data.nome,
        dataNascimento: formatDateForInput(data.dataNascimento), // Aplicando a correção aqui
        valorDisponivel: data.valorDisponivel.toString(),
        status: data.status,
        telefone: data.telefone || '',
        banco: data.banco,
        descricao: data.descricao || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar cliente');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && id) {
      fetchClient();
    }
  }, [token, id]);

  // Formatação do CPF
  const formatCPF = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,3})(\d{0,2})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += match[1];
      if (match[2]) formatted += `.${match[2]}`;
      if (match[3]) formatted += `.${match[3]}`;
      if (match[4]) formatted += `-${match[4]}`;
      return formatted;
    }
    return value;
  };

  // Formatação do telefone
  const formatPhone = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
    if (match) {
      let formatted = '';
      if (match[1]) formatted += `(${match[1]}`;
      if (match[2]) formatted += `) ${match[2]}`;
      if (match[3]) formatted += `-${match[3]}`;
      return formatted;
    }
    return value;
  };

  // Atualiza o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'cpf') {
      setFormData({ ...formData, [name]: formatCPF(value) });
    } else if (name === 'telefone') {
      setFormData({ ...formData, [name]: formatPhone(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Envia o formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!user || !user.id) {
      setError('Usuário não autenticado. Faça login novamente.');
      setLoading(false);
      return;
    }

    try {
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      // Garantir que estamos enviando a data exatamente como está no input,
      // sem permitir que o JavaScript faça qualquer ajuste de timezone
      const formDataToSend = {
        ...formData,
        valorDisponivel: parseFloat(formData.valorDisponivel),
        // Enviamos a data exatamente como está no input, sem converter para Date
        dataNascimento: formData.dataNascimento
      };

      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formDataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar cliente');
      }

      router.push('/clients');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao atualizar cliente');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated() || loading || !client) {
    return <div className="p-8 text-center">Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.push('/clients')}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold">Atualizar Cliente</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-6">
          {/* Informações Pessoais */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Informações Pessoais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Nome
                  </div>
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <IdentificationIcon className="h-5 w-5 mr-2 text-gray-500" />
                    CPF
                  </div>
                </label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Data de Nascimento
                  </div>
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Telefone
                  </div>
                </label>
                <input
                  type="text"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <ClipboardDocumentIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Status
                  </div>
                </label>
                <input
                  type="text"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="border-b pb-4">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Informações Financeiras</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Valor Disponível
                  </div>
                </label>
                <input
                  type="number"
                  name="valorDisponivel"
                  value={formData.valorDisponivel}
                  onChange={handleChange}
                  step="0.01"
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <div className="flex items-center">
                    <BanknotesIcon className="h-5 w-5 mr-2 text-gray-500" />
                    Banco
                  </div>
                </label>
                <input
                  type="text"
                  name="banco"
                  value={formData.banco}
                  onChange={handleChange}
                  className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div>
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Informações Adicionais</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-500" />
                  Descrição
                </div>
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleChange}
                className="block w-full p-2 border border-gray-300 rounded-md bg-yellow-50 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={() => router.push('/clients')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-blue-300 font-medium"
            >
              {loading ? 'Atualizando...' : 'Atualizar Cliente'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}