// src/app/api/users/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { authenticate } from '../../../middleware/auth';
import bcrypt from 'bcryptjs';

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deletar um usuário
 *     description: Remove um usuário do banco de dados com base no id informado (apenas para admin).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser deletado.
 *     responses:
 *       200:
 *         description: Usuário deletado com sucesso.
 *       403:
 *         description: Acesso negado (não admin).
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno no servidor.
 *
 *   put:
 *     summary: Atualizar um usuário
 *     description: Atualiza os dados de um usuário existente (apenas para admin).
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID do usuário a ser atualizado.
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
 *               - role
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso.
 *       400:
 *         description: Requisição inválida.
 *       403:
 *         description: Acesso negado (não admin).
 *       404:
 *         description: Usuário não encontrado.
 *       500:
 *         description: Erro interno no servidor.
 */

export async function DELETE(request, context) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Retorna erro de autenticação (ex.: 401)
    }

    const { user } = authResult;
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem deletar usuários.' },
        { status: 403 }
      );
    }

    // Acessar params após a autenticação
    const { params } = context;
    const { id } = params;

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    const deletedUser = await prisma.user.delete({
      where: { id: Number(id) },
      select: { id: true, email: true },
    });

    return NextResponse.json(deletedUser, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error || 'Erro desconhecido');
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) {
      return authResult; // Retorna erro de autenticação (ex.: 401)
    }

    const { user } = authResult;
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem atualizar usuários.' },
        { status: 403 }
      );
    }

    // Acessar params após a autenticação
    const { params } = context;
    const { id } = params;

    const { email, password, role } = await request.json();

    if (!email || !role) {
      return NextResponse.json(
        { error: 'Os campos email e role são obrigatórios.' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: Number(id) },
    });
    if (!existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado.' },
        { status: 404 }
      );
    }

    // Prepara os dados para atualização
    const updateData = {
      email,
      role,
    };

    if (password) {
      // Se a senha for fornecida, faz o hash e a atualiza
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      select: { id: true, email: true, role: true },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error || 'Erro desconhecido');
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}