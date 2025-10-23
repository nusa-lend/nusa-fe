import { NextResponse } from 'next/server';
import { fetchMarketsFromPonder } from '@/services/marketApiService';
import { processMarketsData } from '@/services/marketProcessingService';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const chain = searchParams.get('chain');

  try {
    const rawMarkets = await fetchMarketsFromPonder(chain || undefined);
    const data = processMarketsData(rawMarkets);

    return new NextResponse(JSON.stringify({ data }), {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30, s-maxage=30',
      },
    });
  } catch (error) {
    return new NextResponse(JSON.stringify({ error: `Failed to fetch markets: ${(error as Error).message}` }), {
      status: 502,
      headers: {
        ...CORS_HEADERS,
        'Content-Type': 'application/json',
      },
    });
  }
}
