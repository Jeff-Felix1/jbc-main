import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/auth';

export async function GET(request: Request) {
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

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const createdStartDate = url.searchParams.get('createdStartDate');
    const createdEndDate = url.searchParams.get('createdEndDate');
    const cpf = url.searchParams.get('cpf');
    const nome = url.searchParams.get('nome');
    const userId = url.searchParams.get('userId');

    let whereClause = user.role === 'admin' ? {} : { userId: user.id };

    if (startDate) {
      whereClause = {
        ...whereClause,
        dataNascimento: {
          ...whereClause.dataNascimento,
          gte: new Date(startDate),
        },
      };
    }

    if (endDate) {
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      whereClause = {
        ...whereClause,
        dataNascimento: {
          ...whereClause.dataNascimento,
          lte: endDateTime,
        },
      };
    }

    if (createdStartDate) {
      whereClause = {
        ...whereClause,
        createdAt: {
          ...whereClause.createdAt,
          gte: new Date(createdStartDate),
        },
      };
    }

    if (createdEndDate) {
      const endDateTime = new Date(createdEndDate);
      endDateTime.setHours(23, 59, 59, 999);

      whereClause = {
        ...whereClause,
        createdAt: {
          ...whereClause.createdAt,
          lte: endDateTime,
        },
      };
    }

    if (cpf) {
      whereClause = {
        ...whereClause,
        cpf: {
          contains: cpf,
        },
      };
    }

    if (nome) {
      whereClause = {
        ...whereClause,
        nome: {
          contains: nome,
          mode: 'insensitive',
        },
      };
    }

    if (userId && user.role === 'admin') {
      whereClause = {
        ...whereClause,
        userId: parseInt(userId),
      };
    }

    const [clients, total] = await prisma.$transaction([
      prisma.client.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
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
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.client.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      data: clients,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erro ao listar clientes:', error);
    let errorMessage = 'Erro interno no servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(request: Request) {
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

    const body = await request.json();

    if (
      !body.cpf ||
      !body.nome ||
      !body.dataNascimento ||
      !body.valorDisponivel ||
      !body.status ||
      !body.banco
    ) {
      return NextResponse.json(
        { error: 'Todos os campos obrigatórios devem ser fornecidos (incluindo banco).' },
        { status: 400 }
      );
    }

    const newClient = await prisma.client.create({
      data: {
        cpf: body.cpf,
        nome: body.nome,
        dataNascimento: new Date(body.dataNascimento),
        valorDisponivel: parseFloat(body.valorDisponivel),
        status: body.status,
        telefone: body.telefone,
        banco: body.banco,
        descricao: body.descricao,
        user: {
          connect: { id: user.id },
        },
        contratos: body.contrato
          ? {
              create: {
                dataContrato: new Date(body.contrato.dataContrato),
                valorContrato: body.contrato.valorContrato,
                parcelas: body.contrato.parcelas,
                juros: body.contrato.juros,
              },
            }
          : undefined,
        updatedAt: new Date(), // Incluído para consistência
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

    return NextResponse.json(newClient, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    let errorMessage = 'Erro interno no servidor';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}