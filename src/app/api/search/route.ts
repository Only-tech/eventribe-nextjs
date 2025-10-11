import { NextRequest, NextResponse } from 'next/server';
import { fetchEvents } from '@/app/lib/data-access/events';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const events = await fetchEvents(query);
    
    return NextResponse.json(events);

  } catch (error) {
    console.error('API Search Error:', error);
    return NextResponse.json({ error: 'Failed to fetch search results.' }, { status: 500 });
  }
}