import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const response = await fetch('https://shiba.hackclub.com/api/GetMyPlaytests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch playtests');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Playtests API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playtests' },
      { status: 500 }
    );
  }
}