// app/users/create/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

export default function CreateUserPage() {
  const router = useRouter();
  const { user, token } = useAuthStore(); // Acessa usuário e token
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "vendedor">("vendedor");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true); // Novo estado para verificar autenticação

  // Verifica autenticação ao carregar a página
  useEffect(() => {
    // Aguarda até que o estado de autenticação esteja pronto
    if (user === undefined) {
      // Ainda está carregando o estado, não faz nada
      return;
    }

    // Estado carregado, verifica se há usuário
    if (!user || !token) {
      router.push("/login"); // Redireciona se não autenticado
    } else {
      setIsCheckingAuth(false); // Autenticação verificada, prossegue
    }
  }, [user, token, router]);

  // Função para submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password || !role) {
      setError("Todos os campos são obrigatórios.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar usuário");
      }

      setSuccess("Usuário criado com sucesso!");
      setEmail("");
      setPassword("");
      setRole("vendedor");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  // Enquanto verifica autenticação, exibe um carregamento
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">Verificando autenticação...</p>
      </div>
    );
  }

  // Se não autenticado, o useEffect já redirecionou, então aqui não precisa verificar novamente
  if (!user) return null;

  // Verifica se o usuário é "admin@admin"
  if (user.email !== "admin@admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900">Acesso Negado</h2>
          <p className="mt-4 text-gray-600">
            Apenas o usuário com email "admin@admin" pode criar novos usuários.
          </p>
        </div>
      </div>
    );
  }

  // Formulário para "admin@admin"
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Criar Novo Usuário
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
              Senha
            </label>
            <input
              type="password"
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            {loading ? "Criando..." : "Criar Usuário"}
          </button>
        </form>
      </div>
    </div>
  );
}