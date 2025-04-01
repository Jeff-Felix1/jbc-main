"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Client {
  id: number;
  nome: string;
  cpf: string;
  valorDisponivel: number;
  createdAt: string;
  user: { email: string };
}

export default function HomePage() {
  const router = useRouter();
  const { user, logout, token, expiresAt } = useAuthStore();
  const [latestClients, setLatestClients] = useState<Client[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Funções de navegação
  const goToClients = () => router.push("/clients");
  const goToUsers = () => router.push("/users");
  const goToHistorico = () => router.push("/history"); // Nova função para o link Histórico

  // Função de logout
  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  // Verifica autenticação ao carregar a página ou quando token/expiração mudar
  useEffect(() => {
    if (!token || (expiresAt && expiresAt < Date.now())) {
      logout();
      router.push("/login");
    }
  }, [token, expiresAt, logout, router]);

  // Verifica se o usuário é admin
  useEffect(() => {
    if (user) {
      setIsAdmin(user.role === "admin");
    }
  }, [user]);

  // Busca os últimos 5 clientes
  const fetchLatestClients = async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/clients?limit=5", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Erro ao carregar clientes");
      const data = await response.json();
      setLatestClients(data.data || []);
    } catch (error) {
      console.error("Erro ao buscar últimos clientes:", error);
    }
  };

  // Carrega os dados ao montar ou quando o token mudar (apenas para admins)
  useEffect(() => {
    if (isAdmin && token) {
      fetchLatestClients();
    }
  }, [isAdmin, token]);

  // Se não for admin, exibir mensagem de acesso restrito
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Cabeçalho */}
        <header className="bg-gray-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Image
                src="/logo.png"
                alt="Logo do Sistema"
                width={250}
                height={50}
                className="object-contain"
              />
              <nav className="flex space-x-4 items-center">
                <button
                  onClick={goToClients}
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Clientes
                </button>
                {user && (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Sair
                  </button>
                )}
              </nav>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Bem-vindo ao Sistema
            </h2>
            {user && (
              <p className="mt-2 text-lg text-gray-600">
                Logado como: {user.email}
              </p>
            )}
            <div className="mt-12 p-6 bg-yellow-50 border border-yellow-200 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-yellow-800">Acesso Restrito</h3>
              <p className="mt-2 text-yellow-700">
                O dashboard administrativo está disponível apenas para administradores do sistema.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dashboard administrativo com cabeçalho atualizado
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cabeçalho */}
      <header className="bg-gray-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Image
              src="/logo.png"
              alt="Logo do Sistema"
              width={120}
              height={40}
              className="object-contain"
            />
            <nav className="flex space-x-4 items-center">
              <button
                onClick={goToClients}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Clientes
              </button>
              <button
                onClick={goToUsers}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Usuários
              </button>
              <button
                onClick={goToHistorico}
                className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Histórico
              </button>
              {user && (
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Sair
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Dashboard Administrativo
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Visão geral dos últimos clientes cadastrados
          </p>
          {user && (
            <p className="mt-2 text-sm text-gray-500">
              Administrador: {user.email}
            </p>
          )}
        </div>

        {/* Últimos 5 Clientes */}
        {isAdmin && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Últimos 5 Clientes Cadastrados
            </h3>
            {latestClients.length > 0 ? (
              <ul className="space-y-4">
                {latestClients.map((client) => (
                  <li key={client.id} className="p-4 bg-gray-50 rounded-lg">
                    <p><strong>Nome:</strong> {client.nome}</p>
                    <p><strong>CPF:</strong> {client.cpf}</p>
                    <p><strong>Valor Disponível:</strong> R$ {client.valorDisponivel ? parseFloat(client.valorDisponivel.toString()).toFixed(2) : "0.00"}</p>
                    <p><strong>Criado em:</strong> {new Date(client.createdAt).toLocaleDateString("pt-BR")}</p>
                    <p><strong>Usuário:</strong> {client.user.email}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Nenhum cliente cadastrado recentemente.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}