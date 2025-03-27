// src/app/api/login/route.ts
import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

interface User {
  id: number;
  email: string;
  password: string;
  role: string;
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // 1. Validação dos campos de entrada
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    // 2. Busca o usuário no banco de dados
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      // Não revelar que o email não existe por questões de segurança
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // 3. Verificação da senha com bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      );
    }

    // 4. Geração do token JWT
    if (!process.env.JWT_SECRET) {
      throw new Error('Variável de ambiente JWT_SECRET não configurada');
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token expira em 24 horas
    );

    // 5. Remover a senha do objeto de resposta
    const userWithoutPassword: Omit<User, 'password'> = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    // 6. Configuração de cookies seguros (opcional)
    const response = NextResponse.json({
      token,
      user: userWithoutPassword,
    });

    // Se quiser usar cookies httpOnly:
    // response.cookies.set('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 86400, // 24 horas
    // });

    return response;

  } catch (error) {
    console.error('Erro no processo de login:', error);

    // 7. Tratamento de erros genérico
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Ocorreu um erro desconhecido durante o login';

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}