"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface User {
  id: number;
  email: string;
  role: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { user, token, isAdmin } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (!user || !token) {
      router.push("/login");
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, token, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao carregar usuários");
        }

        const responseData = await response.json();
        
        // Correctly handle the API response structure
        if (responseData.data && Array.isArray(responseData.data)) {
          setUsers(responseData.data);
        } else {
          throw new Error("A resposta da API não é uma lista de usuários válida");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
        setUsers([]); // Define como array vazio em caso de erro
      } finally {
        setLoading(false);
      }
    };

    if (!isCheckingAuth && user && isAdmin()) {
      fetchUsers();
    } else if (!isCheckingAuth) {
      setLoading(false);
    }
  }, [isCheckingAuth, user, token, isAdmin]);

  const handleDelete = async (userId: number) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir usuário");
      }

      // Remove the deleted user from the list
      setUsers(users.filter((u) => u.id !== userId));
      alert("Usuário excluído com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    }
  };

  const handleUpdate = (userId: number) => {
    router.push(`/users/update/${userId}`);
  };

  const handleAddUser = () => {
    router.push("/users/create");
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  if (!user || !token) return null;

  if (!isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
          <p className="mt-4 text-gray-600">
            Apenas administradores podem visualizar e gerenciar usuários.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Lista de Usuários</h1>
          <button
            onClick={handleAddUser}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow-sm"
          >
            Adicionar
          </button>
        </div>

        {loading ? (
          <p className="text-gray-600">Carregando usuários...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : users.length === 0 ? (
          <p className="text-gray-600">Nenhum usuário encontrado.</p>
        ) : (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role === 'admin' ? 'Administrador' : 'Vendedor'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleUpdate(user.id)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Atualizar
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}