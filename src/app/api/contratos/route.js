// src/app/api/contratos/route.js
import { NextResponse } from 'next/server';
import prisma from '../../lib/prisma';

/**
 * @swagger
 * /api/contratos:
 *   post:
 *     tags: [Contrato]
 *     summary: Cria um novo contrato para um cliente
 *     description: Cria um novo contrato e o associa a um cliente através do campo clientId. Todos os campos são obrigatórios.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clientId:
 *                 type: integer
 *               dataContrato:
 *                 type: string
 *                 format: date-time
 *               valorContrato:
 *                 type: number
 *               parcelas:
 *                 type: integer
 *               juros:
 *                 type: number
 *             required:
 *               - clientId
 *               - dataContrato
 *               - valorContrato
 *               - parcelas
 *               - juros
 *     responses:
 *       201:
 *         description: Contrato criado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Contrato'
 *       400:
 *         description: Requisição inválida.
 *       500:
 *         description: Erro interno no servidor.
 *
 *   get:
 *     tags: [Contrato]
 *     summary: Lista todos os contratos
 *     description: Retorna a lista de todos os contratos cadastrados, incluindo os dados do cliente associado.
 *     responses:
 *       200:
 *         description: Lista de contratos retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Contrato'
 *       500:
 *         description: Erro interno no servidor.
 */
export async function POST(request) {
  try {
    const { clientId, dataContrato, valorContrato, parcelas, juros } = await request.json();

    if (
      !clientId ||
      !dataContrato ||
      valorContrato === undefined ||
      parcelas === undefined ||
      juros === undefined
    ) {
      return NextResponse.json(
        { error: 'Os campos clientId, dataContrato, valorContrato, parcelas e juros são obrigatórios.' },
        { status: 400 }
      );
    }

    const newContrato = await prisma.contrato.create({
      data: {
        clientId,
        dataContrato: new Date(dataContrato),
        valorContrato,
        parcelas,
        juros,
      },
    });

    return NextResponse.json(newContrato, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar contrato:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const contratos = await prisma.contrato.findMany({
      include: { client: true },
    });
    return NextResponse.json(contratos, { status: 200 });
  } catch (error) {
    console.error('Erro ao listar contratos:', error);
    return NextResponse.json({ error: 'Erro interno no servidor.' }, { status: 500 });
  }
}
