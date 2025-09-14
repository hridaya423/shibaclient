import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch('https://shiba.hackclub.com/api/GetMyGames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Referer': 'https://shiba.hackclub.com/my-games',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          'sec-ch-ua': '"Not;A=Brand";v="99", "Google Chrome";v="139", "Chromium";v="139"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
        },
        body: JSON.stringify({ token }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json(data);
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Games API timeout');
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Games API error:', error);
    return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 });
  }
}