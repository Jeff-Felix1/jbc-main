// src/middleware/auth.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  id: number;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

interface AuthResultSuccess {
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export async function authenticate(request: Request): Promise<AuthResultSuccess | NextResponse> {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('Token não fornecido ou formato inválido:', authHeader);
    return NextResponse.json(
      { error: 'Token de autenticação não fornecido ou formato inválido.' },
      { status: 401 }
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('Token vazio após split');
    return NextResponse.json(
      { error: 'Token de autenticação vazio.' },
      { status: 401 }
    );
  }

  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET não definido no ambiente');
      return NextResponse.json(
        { error: 'Erro de configuração do servidor.' },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as DecodedToken;
    console.log('Token decodificado em authenticate:', decoded); // Log para depuração

    if (!decoded || !decoded.id || !decoded.email || decoded.role === undefined) {
      console.error('Token decodificado incompleto:', decoded);
      return NextResponse.json(
        { error: 'Token inválido ou mal formado.' },
        { status: 401 }
      );
    }

    if (decoded.exp * 1000 < Date.now()) {
      console.error('Token expirado:', decoded);
      return NextResponse.json(
        { error: 'Token expirado, faça login novamente.' },
        { status: 401 }
      );
    }

    return {
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      },
    };
  } catch (error) {
    console.error('Erro na verificação do token:', error);
    return NextResponse.json(
      { error: 'Token inválido ou expirado.' },
      { status: 401 }
    );
  }
}