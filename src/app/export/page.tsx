"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

interface ExportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  userId?: string;
  banco?: string;
  limit?: number;
}

interface User {
  id: number;
  email: string;
}

export default function ExportPage() {
  const router = useRouter();
  const { token } = useAuthStore();
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [filters, setFilters] = useState<ExportFilters>({});
  const [users, setUsers] = useState<User[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [bancos, setBancos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Carrega lista de usuários, status e bancos únicos
  useEffect(() => {
    const fetchUsersStatusesAndBancos = async () => {
      try {
        // Busca usuários
        const usersResponse = await fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          // Se a resposta tiver a propriedade "data", usa-a; caso contrário, assume que já é um array
          setUsers(Array.isArray(usersData) ? usersData : usersData.data);
        }

        // Busca status e bancos únicos
        const clientsResponse = await fetch("/api/clients", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (clientsResponse.ok) {
          const clientsData = await clientsResponse.json();
          const uniqueStatuses = [
            ...new Set(clientsData.data.map((client: any) => client.status)),
          ];
          const uniqueBancos = [
            ...new Set(clientsData.data.map((client: any) => client.banco)),
          ];
          setStatuses(uniqueStatuses);
          setBancos(uniqueBancos);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
    };

    if (token) fetchUsersStatusesAndBancos();
  }, [token]);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail: credentials.email,
          adminPassword: credentials.password,
          filters: {
            ...filters,
            userId: filters.userId === "" ? undefined : filters.userId, // Remove filtro se "Todos"
            status: filters.status === "" ? undefined : filters.status, // Remove filtro se "Todos"
            banco: filters.banco === "" ? undefined : filters.banco, // Remove filtro se "Todos"
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na exportação");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clientes_export_${Date.now()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Cabeçalho com botão Cancelar */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/clients')}
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
            Cancelar
          </button>
          <h1 className="text-2xl font-bold">Exportação de Clientes</h1>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Email Admin</label>
            <input
              type="email"
              className="w-full p-2 border rounded"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Senha Admin</label>
            <input
              type="password"
              className="w-full p-2 border rounded"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block text-sm font-medium mb-1">Data Inicial</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              onChange={(e) =>
                setFilters({ ...filters, startDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Data Final</label>
            <input
              type="date"
              className="w-full p-2 border rounded"
              onChange={(e) =>
                setFilters({ ...filters, endDate: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.status || ""}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">Todos</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vendedor</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.userId || ""}
              onChange={(e) =>
                setFilters({ ...filters, userId: e.target.value })
              }
            >
              <option value="">Todos</option>
              {Array.isArray(users) &&
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Banco</label>
            <select
              className="w-full p-2 border rounded"
              value={filters.banco || ""}
              onChange={(e) =>
                setFilters({ ...filters, banco: e.target.value })
              }
            >
              <option value="">Todos</option>
              {bancos.map((banco) => (
                <option key={banco} value={banco}>
                  {banco}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}

        <button
          onClick={handleExport}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
          disabled={loading}
        >
          {loading ? "Exportando..." : "Exportar Clientes"}
        </button>
      </div>
    </div>
  );
}