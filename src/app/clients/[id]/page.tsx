'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface Client {
  id: number;
  nome: string;
  cpf: string;
  status: string;
  telefone?: string;
  banco: string;
  descricao?: string;
  dataNascimento: string;
  valorDisponivel?: number; // Opcional para consistência com a listagem
  user: { email: string };
  contratos: {
    id: number;
    dataContrato: string;
    valorContrato: number;
    parcelas: number;
    juros: number;
  }[];
}

export default function ClientDetailsPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const { id } = useParams();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);

        if (!id || isNaN(Number(id))) {
          throw new Error('ID do cliente inválido');
        }

        const response = await fetch(`/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          let errorMessage = 'Erro ao carregar detalhes do cliente';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (jsonError) {
            console.error('Erro ao decodificar JSON:', jsonError);
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();

        // Converte valorDisponivel para número, se vier como string
        if (typeof data.valorDisponivel === 'string') {
          data.valorDisponivel = parseFloat(data.valorDisponivel);
        }

        setClient(data);
      } catch (error) {
        console.error('Erro ao buscar cliente:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchClient();
  }, [id, token]);

  if (loading) {
    return <div className="container mx-auto p-4">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Erro:</strong> {error}
        </div>
        <button
          onClick={() => router.push('/clients')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Cliente não encontrado.
        </div>
        <button
          onClick={() => router.push('/clients')}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Voltar para a lista
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Detalhes do Cliente</h1>

      <div
        className={`bg-white p-6 rounded-lg shadow-md ${
          client.valorDisponivel && client.valorDisponivel > 0
            ? 'border-green-500 border-2'
            : 'border-gray-300 border-2'
        }`}
      >
        <h2 className="text-xl font-semibold mb-4">{client.nome}</h2>
        <div className="space-y-2">
          <p><strong>CPF:</strong> {client.cpf}</p>
          <p><strong>Status:</strong> {client.status}</p>
          <p><strong>Telefone:</strong> {client.telefone || 'Não informado'}</p>
          <p><strong>Banco:</strong> {client.banco}</p>
          <p><strong>Descrição:</strong> {client.descricao || 'Não informada'}</p>
          <p>
            <strong>Data de Nascimento:</strong>{' '}
            {new Date(client.dataNascimento).toLocaleDateString()}
          </p>
          <p>
            <strong>Valor Disponível:</strong> R${' '}
            {client.valorDisponivel ? client.valorDisponivel.toFixed(2) : '0.00'}
          </p>
          <p><strong>Criado por:</strong> {client.user.email}</p>
        </div>

        <h3 className="text-lg font-semibold mt-6 mb-2">Contratos</h3>
        {client.contratos.length > 0 ? (
          <ul className="space-y-4">
            {client.contratos.map((contrato) => (
              <li key={contrato.id} className="bg-gray-50 p-4 rounded-lg">
                <p>
                  <strong>Data do Contrato:</strong>{' '}
                  {new Date(contrato.dataContrato).toLocaleDateString()}
                </p>
                <p>
                  <strong>Valor do Contrato:</strong> R${' '}
                  {typeof contrato.valorContrato === 'number'
                    ? contrato.valorContrato.toFixed(2)
                    : 'N/A'}
                </p>
                <p><strong>Parcelas:</strong> {contrato.parcelas}</p>
                <p>
                  <strong>Juros:</strong>{' '}
                  {typeof contrato.juros === 'number'
                    ? contrato.juros.toFixed(2) + '%'
                    : 'N/A'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Nenhum contrato encontrado.</p>
        )}
      </div>

      <button
        onClick={() => router.push('/clients')}
        className="mt-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Voltar para a lista
      </button>
    </div>
  );
}