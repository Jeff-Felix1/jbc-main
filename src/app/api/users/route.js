import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";

import { authenticate } from "../../middleware/auth";

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Cadastro de um novo usuário
 *     description: Cria um usuário no banco de dados com os campos email, password e role.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [admin, vendedor]
 *             required:
 *               - email
 *               - password
 *               - role
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso.
 *       400:
 *         description: Requisição inválida.
 *       409:
 *         description: Usuário já existe.
 *       500:
 *         description: Erro interno no servidor.
 *
 *   get:
 *     summary: Lista todos os usuários
 *     description: Retorna a lista de todos os usuários cadastrados (apenas para admin).
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número da página para paginação
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Número de usuários por página
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [admin, vendedor]
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *       403:
 *         description: Acesso negado (não admin).
 *       500:
 *         description: Erro interno no servidor.
 */

export async function POST(request) {
  try {
    const { email, password, role } = await request.json();

    // Validação dos campos obrigatórios
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Os campos email, password e role são obrigatórios." },
        { status: 400 }
      );
    }

    // Verifica se o usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Usuário já existe." },
        { status: 409 }
      );
    }

    // Criação do novo usuário
    const newUser = await prisma.user.create({
      data: {
        email,
        password: password,
        role,
      },
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    // Autenticação
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;

    // Verifica se o usuário é administrador
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem visualizar usuários." },
        { status: 403 }
      );
    }

    // Extrair parâmetros da URL para paginação
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");

    // Logs para depuração
    console.log("Parâmetros recebidos:", { page, limit });

    // Consulta ao banco de dados para buscar usuários
    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" }, // Ordem por ID, pode ser ajustado
        select: {
          id: true,
          email: true,
          role: true,
        },
      }),
      prisma.user.count(),
    ]);

    // Resposta com a lista de usuários
    return NextResponse.json({
      data: users || [], // Garante que sempre seja um array
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erro ao listar usuários:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    );
  }
}