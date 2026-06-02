import { NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');

    if (!monthStr || !yearStr) {
      return NextResponse.json({ error: 'Mês e ano são obrigatórios' }, { status: 400 });
    }

    const month = parseInt(monthStr);
    const year = parseInt(yearStr);

    // Formata o range do mês (primeiro até o último dia do mês)
    const beginDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Busca no Mercado Pago pagamentos aprovados neste intervalo
    // MP SDK v3 search accept options -> begin_date, end_date
    const searchResult = await payment.search({
      options: {
        begin_date: beginDate,
        end_date: endDate,
        status: 'approved',
        // limit: 100 // default is usually 30, we can fetch up to 100 per page. If there are more, we would need to paginate.
      }
    });

    const payments = searchResult.results || [];
    
    // Filtramos e somamos o valor das transações
    // Ignoramos transações que possam ser apenas "testes" se necessário,
    // mas o status 'approved' garante pagamentos reais.
    let totalRevenue = 0;
    const items = payments.map((p: any) => {
        totalRevenue += Number(p.transaction_amount) || 0;
        return {
            id: p.id,
            date: p.date_created,
            amount: p.transaction_amount,
            status: p.status,
            payment_method: p.payment_method_id,
            email: p.payer?.email || 'N/A'
        }
    });

    return NextResponse.json({
      month,
      year,
      totalRevenue,
      transactionsCount: items.length,
      items
    });

  } catch (error: any) {
    console.error('Erro ao buscar faturamento mensal:', error);
    return NextResponse.json({ error: 'Erro interno ao processar faturamento' }, { status: 500 });
  }
}
