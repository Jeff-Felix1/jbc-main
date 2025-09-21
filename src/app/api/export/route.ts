import { NextResponse } from "next/server";
import prisma from "../../lib/prisma";
import * as ExcelJS from "exceljs";
import { authenticate } from "../../middleware/auth";

interface ExportRequest {
  filters: {
    startDate?: string;
    endDate?: string;
    status?: string;
    userId?: string;
    banco?: string;
    limit?: number;
  };
}

export async function POST(request: Request) {
  try {
    const authResult = await authenticate(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }
    const { user } = authResult;

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Acesso negado. Apenas administradores podem exportar dados.' }, { status: 403 });
    }

    const body: ExportRequest = await request.json();

    // Construir filtros
    const whereClause: any = {};
    const MAX_LIMIT = 5000;

    // Filtro de datas corrigido
    if (body.filters.startDate || body.filters.endDate) {
      whereClause.createdAt = {};

      // Data inicial: início do dia (00:00:00)
      if (body.filters.startDate) {
        const startDate = new Date(body.filters.startDate);
        startDate.setUTCHours(0, 0, 0, 0); // Define como meia-noite UTC
        whereClause.createdAt.gte = startDate;
      }

      // Data final: fim do dia (23:59:59.999)
      if (body.filters.endDate) {
        const endDate = new Date(body.filters.endDate);
        endDate.setUTCHours(23, 59, 59, 999); // Define como fim do dia UTC
        whereClause.createdAt.lte = endDate;
      }

      // Se startDate e endDate forem iguais, ajusta para cobrir o dia inteiro
      if (
        body.filters.startDate &&
        body.filters.endDate &&
        body.filters.startDate === body.filters.endDate
      ) {
        const singleDate = new Date(body.filters.startDate);
        whereClause.createdAt = {
          gte: new Date(singleDate.setUTCHours(0, 0, 0, 0)),
          lte: new Date(singleDate.setUTCHours(23, 59, 59, 999)),
        };
      }
    }

    // Filtro por status
    if (body.filters.status) {
      whereClause.status = body.filters.status;
    }

    // Filtro por usuário (vendedor)
    if (body.filters.userId) {
      whereClause.userId = parseInt(body.filters.userId);
    }

    // Filtro por banco
    if (body.filters.banco) {
      whereClause.banco = body.filters.banco;
    }

    // Aplicar limite
    const take = body.filters.limit
      ? Math.min(Math.max(body.filters.limit, 1), MAX_LIMIT)
      : MAX_LIMIT;

    // Buscar dados de todos os clientes no período
    const clients = await prisma.client.findMany({
      where: whereClause,
      take,
      include: {
        user: { select: { id: true, email: true } }, // Inclui dados do vendedor
      },
      orderBy: { createdAt: "desc" },
    });

    // Criar arquivo Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Clientes");

    // Cabeçalhos
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Nome", key: "nome", width: 30 },
      { header: "CPF", key: "cpf", width: 15 },
      { header: "Data Nascimento", key: "dataNascimento", width: 20 },
      { header: "Telefone", key: "telefone", width: 15 },
      { header: "Vendedor ID", key: "sellerId", width: 12 },
      { header: "Vendedor Email", key: "sellerEmail", width: 25 },
      { header: "Data Criação", key: "createdAt", width: 20 },
      { header: "Valor Disponível", key: "valorDisponivel", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Banco", key: "banco", width: 20 },
      { header: "Descrição", key: "descricao", width: 40 },
    ];

    worksheet.getRow(1).font = { bold: true };

    // Dados
    clients.forEach((client) => {
      worksheet.addRow({
        id: client.id,
        nome: client.nome,
        cpf: client.cpf,
        dataNascimento: client.dataNascimento,
        telefone: client.telefone || "Não informado",
        sellerId: client.user.id,
        sellerEmail: client.user.email,
        createdAt: client.createdAt.toISOString(),
        valorDisponivel: client.valorDisponivel,
        status: client.status,
        banco: client.banco,
        descricao: client.descricao || "Não informada",
      });
    });

    // Formatação
    worksheet.getColumn("valorDisponivel").numFmt = '"R$"#,##0.00'; // Formatação monetária
    worksheet.getColumn("createdAt").numFmt = "dd/mm/yyyy hh:mm"; // Formatação de data
    worksheet.getColumn("dataNascimento").numFmt = "dd/mm/yyyy"; // Formatação de data

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="clientes_export_${Date.now()}.xlsx"`,
      },
    });
  } catch (error) {
    console.error("Erro na exportação:", error);
    return NextResponse.json(
      { error: "Erro interno durante a exportação" },
      { status: 500 }
    );
  }
}