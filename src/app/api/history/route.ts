import { NextResponse } from 'next/server';
import { fetchHistoryData } from '@/services/apiService';
import { processHistoryData } from '@/services/historyService';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Content-Type': 'application/json',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  
  if (!account) {
    return new NextResponse(JSON.stringify({ error: 'Missing account' }), {
      status: 400,
      headers: CORS_HEADERS,
    });
  }

  const chain = searchParams.get('chain');
  const limit = searchParams.get('limit');

  try {
    const { loanItems, supplyItems, marketRates } = await fetchHistoryData(
      account, 
      chain || undefined, 
      limit ? Number(limit) : undefined
    );

    const processedData = processHistoryData(loanItems, supplyItems, marketRates);

    return new NextResponse(JSON.stringify({ data: processedData }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Cache-Control': 'public, max-age=30, s-maxage=30',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new NextResponse(JSON.stringify({ error: `Failed to fetch history: ${errorMessage}` }), {
      status: 502,
      headers: CORS_HEADERS,
    });
  }
}
