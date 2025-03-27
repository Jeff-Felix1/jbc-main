import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { authenticate } from '../../../middleware/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const clientId = parseInt(params.id);

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
        updatedAt: true, // Incluído para ser retornado
        user: {
          select: {
            email: true,
          },
        },
        contratos: true,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    if (!user.role || (user.role !== 'admin' && client.userId !== user.id)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para acessar este cliente' },
        { status: 403 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    let errorMessage = 'Erro interno no servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const clientId = parseInt(params.id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      select: { userId: true },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    if (!user.role || (user.role !== 'admin' && existingClient.userId !== user.id)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para atualizar este cliente' },
        { status: 403 }
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
      contrato,
    } = body;

    const updatedClient = await prisma.client.update({
      where: { id: clientId },
      data: {
        cpf: cpf ? cpf : undefined,
        nome: nome ? nome : undefined,
        dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
        valorDisponivel: valorDisponivel
          ? typeof valorDisponivel === 'string'
            ? parseFloat(valorDisponivel)
            : valorDisponivel
          : undefined,
        status: status ? status : undefined,
        telefone: telefone !== undefined ? telefone : undefined,
        banco: banco ? banco : undefined,
        descricao: descricao !== undefined ? descricao : undefined,
        updatedAt: new Date(), // Atualizado automaticamente ao modificar
      },
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
        updatedAt: true, // Incluído para ser retornado
        user: {
          select: {
            email: true,
          },
        },
        contratos: true,
      },
    });

    if (contrato) {
      await prisma.contrato.create({
        data: {
          dataContrato: new Date(contrato.dataContrato),
          valorContrato: contrato.valorContrato,
          parcelas: contrato.parcelas,
          juros: contrato.juros,
          clientId: clientId,
        },
      });

      const clientWithNewContract = await prisma.client.findUnique({
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
          updatedAt: true, // Incluído para ser retornado
          user: {
            select: {
              email: true,
            },
          },
          contratos: true,
        },
      });

      return NextResponse.json(clientWithNewContract);
    }

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    let errorMessage = 'Erro interno no servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const clientId = parseInt(params.id);

    if (isNaN(clientId)) {
      return NextResponse.json(
        { error: 'ID de cliente inválido' },
        { status: 400 }
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: { id: clientId },
      select: { userId: true },
    });

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente não encontrado' },
        { status: 404 }
      );
    }

    if (!user.role || (user.role !== 'admin' && existingClient.userId !== user.id)) {
      return NextResponse.json(
        { error: 'Você não tem permissão para excluir este cliente' },
        { status: 403 }
      );
    }

    await prisma.contrato.deleteMany({
      where: { clientId },
    });

    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json(
      { message: 'Cliente excluído com sucesso' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    let errorMessage = 'Erro interno no servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}