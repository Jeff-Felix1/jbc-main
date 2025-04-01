import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/auth';

export async function GET(request: Request) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) return authResult;

    const { user } = authResult;

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem ver o histórico.' },
        { status: 403 }
      );
    }

    const history = await prisma.clientHistory.findMany({
      include: {
        user: { select: { email: true } },
        client: { select: { nome: true, cpf: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor' },
      { status: 500 }
    );
  }
}