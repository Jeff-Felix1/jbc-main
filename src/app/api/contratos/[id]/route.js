// src/app/api/contratos/[id]/route.js
import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// DELETE - Remove um contrato pelo id
export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const contratoId = Number(id);

    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
    });
    if (!contrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado.' },
        { status: 404 }
      );
    }

    const deletedContrato = await prisma.contrato.delete({
      where: { id: contratoId },
    });
    return NextResponse.json(deletedContrato, { status: 200 });
  } catch (error) {
    console.error('Erro ao deletar contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}

// PUT - Atualiza um contrato pelo id
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const contratoId = Number(id);
    const data = await request.json();

    // Preparar os dados de atualização (permitindo atualização parcial)
    const updateData = {};
    if (data.dataContrato !== undefined) {
      updateData.dataContrato = new Date(data.dataContrato);
    }
    if (data.valorContrato !== undefined) {
      updateData.valorContrato = data.valorContrato;
    }
    if (data.parcelas !== undefined) {
      updateData.parcelas = data.parcelas;
    }
    if (data.juros !== undefined) {
      updateData.juros = data.juros;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo para atualizar foi fornecido.' },
        { status: 400 }
      );
    }

    // Verifica se o contrato existe
    const contrato = await prisma.contrato.findUnique({
      where: { id: contratoId },
    });
    if (!contrato) {
      return NextResponse.json(
        { error: 'Contrato não encontrado.' },
        { status: 404 }
      );
    }

    const updatedContrato = await prisma.contrato.update({
      where: { id: contratoId },
      data: updateData,
    });

    return NextResponse.json(updatedContrato, { status: 200 });
  } catch (error) {
    console.error('Erro ao atualizar contrato:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}
