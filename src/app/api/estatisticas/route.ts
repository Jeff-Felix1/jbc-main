import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import { authenticate } from '../../middleware/auth';

export async function GET(request: Request) {
  const authResult = await authenticate(request);
  if (authResult instanceof NextResponse) {
    return authResult; // Not authenticated or other error
  }

  const { user } = authResult;
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // e.g., '9' for September
  const year = searchParams.get('year');   // e.g., '2025'

  if (!month || !year) {
    return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 });
  }

  const startDate = new Date(Number(year), Number(month) - 1, 1);
  const endDate = new Date(Number(year), Number(month), 0);

  try {
    const clientCounts = await prisma.user.findMany({
      where: {
        role: 'vendedor', // Counting clients for sellers
      },
      select: {
        id: true,
        email: true,
        clients: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const stats = clientCounts.map(user => ({
      userId: user.id,
      userEmail: user.email,
      clientCount: user.clients.length,
    }));

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    return NextResponse.json({ error: 'Erro interno no servidor' }, { status: 500 });
  }
}
