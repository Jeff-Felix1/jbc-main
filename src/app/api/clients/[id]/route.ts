import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { authenticate } from '../../../middleware/auth';

// GET: Buscar um cliente por ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        cpf: true,
        nome: true,
        dataNascimento: true,
        valorDisponivel: true,
        status: true,
        telefone: true,
        banco: true,
        descricao: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true } },
        contratos: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Formatar a data para evitar problemas de fuso horário
    const responseData = {
      ...client,
      // Formatar a data como YYYY-MM-DD para evitar problemas de fuso horário
      dataNascimento: client.dataNascimento instanceof Date 
        ? client.dataNascimento.toISOString().split('T')[0]
        : client.dataNascimento,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

// PUT: Atualizar um cliente por ID
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = parseInt(id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        cpf: true,
        nome: true,
        dataNascimento: true,
        valorDisponivel: true,
        status: true,
        telefone: true,
        banco: true,
        descricao: true,
        userId: true,
      },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      cpf,
      nome,
      dataNascimento,
      valorDisponivel,
      status,
      telefone,
      banco,
      descricao,
    } = body;

    const updateData: any = {};
    if (cpf !== undefined) updateData.cpf = cpf;
    if (nome !== undefined) updateData.nome = nome;
    
    // Corrigir tratamento da data para evitar problemas de fuso horário
        if (dataNascimento !== undefined) {
      const newDateString = dataNascimento.split('T')[0];
      const oldDate = existingClient.dataNascimento || new Date(0);
      const oldDateString = oldDate.toISOString().split('T')[0];

      if (newDateString !== oldDateString) {
        updateData.dataNascimento = new Date(`${newDateString}T12:00:00Z`);
      }
    }
    
    if (valorDisponivel !== undefined)
      updateData.valorDisponivel =
        typeof valorDisponivel === 'string'
          ? parseFloat(valorDisponivel)
          : valorDisponivel;
    if (status !== undefined) updateData.status = status;
    if (telefone !== undefined) updateData.telefone = telefone;
    if (banco !== undefined) updateData.banco = banco;
    if (descricao !== undefined) updateData.descricao = descricao;
    updateData.updatedAt = new Date();

    // Registrar alterações no histórico
    const historyEntries = [];
    for (const key in updateData) {
      if (key === 'updatedAt') continue; // Ignorar o campo updatedAt
      const oldValue = existingClient[key]?.toString() || null;
      const newValue = updateData[key]?.toString() || null;
      if (oldValue !== newValue) {
        historyEntries.push({
          clientId,
          field: key,
          oldValue,
          newValue,
          userId: user.id,
          createdAt: new Date(),
        });
      }
    }

    // Se houver alterações, registrar no histórico
    if (historyEntries.length > 0) {
      await prisma.clientHistory.createMany({
        data: historyEntries,
      });
    }

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: updateData,
      select: {
        id: true,
        cpf: true,
        nome: true,
        dataNascimento: true,
        valorDisponivel: true,
        status: true,
        telefone: true,
        banco: true,
        descricao: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { email: true } },
        contratos: true,
      },
    });

    // Formatar a data na resposta para evitar problemas de fuso horário
    const responseData = {
      ...updatedClient,
      dataNascimento: updatedClient.dataNascimento instanceof Date 
        ? updatedClient.dataNascimento.toISOString().split('T')[0]
        : updatedClient.dataNascimento,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const clientId = parseInt(id);

    // Verificar se o ID é válido
    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    // Autenticar o usuário
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;
    const { user } = authResult;
    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    // Verificar se o usuário é administrador
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem excluir clientes.' },
        { status: 403 }
      );
    }

    // Verificar se o cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId },
    });
    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    // Excluir o cliente
    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ message: 'Cliente excluído com sucesso' });
  } catch (error) {
    // Logar o erro de forma segura, mesmo que seja null ou undefined
    console.error('Erro ao excluir cliente:', error || 'Erro desconhecido');
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}