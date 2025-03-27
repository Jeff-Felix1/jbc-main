"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function UpdateUserPage() {
  const router = useRouter();
  const { id } = useParams(); // Pega o ID da URL
  const { user, token, isAdmin } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // Senha opcional
  const [role, setRole] = useState<"admin" | "vendedor">("vendedor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Verifica autenticação e permissão
  useEffect(() => {
    if (user === undefined) {
      return;
    }

    if (!user || !token) {
      router.push("/login");
    } else if (!isAdmin()) {
      router.push("/users"); // Redireciona se não for admin
    } else {
      setIsCheckingAuth(false);
    }
  }, [user, token, isAdmin, router]);

  // Carrega os dados do usuário existente
  useEffect(() => {
    const fetchUser = async () => {
      if (!id || isCheckingAuth) return;

      try {
        const response = await fetch(`/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Erro ao carregar usuário");
        }

        const userData = await response.json();
        setEmail(userData.email);
        setRole(userData.role || "vendedor");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido");
      } finally {
        setLoading(false);
      }
    };

    if (!isCheckingAuth && user && isAdmin()) {
      fetchUser();
    }
  }, [id, isCheckingAuth, token, user, isAdmin]);

  // Função para atualizar o usuário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !role) {
      setError("Email e papel são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const updateData: { email: string; role: string; password?: string } = {
        email,
        role,
      };
      if (password) updateData.password = password; // Inclui senha apenas se preenchida

      const response = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar usuário");
      }

      setSuccess("Usuário atualizado com sucesso!");
      setPassword(""); // Limpa o campo de senha após sucesso
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
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
            Apenas administradores podem atualizar usuários.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Atualizar Usuário
        </h2>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Senha (opcional)
            </label>
            <input
              type="password"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Deixe em branco para manter a senha atual"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Papel
            </label>
            <select
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "vendedor")}
            >
              <option value="vendedor">Vendedor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? "bg-indigo-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Atualizando..." : "Atualizar Usuário"}
          </button>
        </form>
      </div>
    </div>
  );
}