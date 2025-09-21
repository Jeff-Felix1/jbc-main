import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

export async function GET() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    const users = await prisma.user.findMany();
    console.log('Conexão bem-sucedida, usuários encontrados:', users.length);
    return NextResponse.json({ 
      success: true, 
      userCount: users.length, 
      users: users.map(u => u.email) 
    });
  } catch (error) {
    console.error("Erro no teste de conexão:", error);
    // Garantir que o erro seja serializável
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    const errorStack = error instanceof Error ? error.stack : '';
    return NextResponse.json({ 
      success: false, 
      error: errorMessage,
      stack: errorStack
    }, { status: 500 });
  }
}
