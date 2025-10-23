import { NextResponse } from 'next/server';
import { fetchPositionsFromPonder } from '@/services/positionApiService';
import { processPositionsData } from '@/services/positionProcessingService';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const account = searchParams.get('account');
  
  if (!account) {
    return NextResponse.json(
      { error: 'Missing account' },
      {
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }

  const chain = searchParams.get('chain');

  try {
    const rawPositions = await fetchPositionsFromPonder(account, chain || undefined);
    const processedData = processPositionsData(rawPositions);

    return NextResponse.json(
      { data: processedData },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, s-maxage=30',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to fetch positions: ${errorMessage}` },
      {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      }
    );
  }
}