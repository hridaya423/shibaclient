import { NextRequest, NextResponse } from 'next/server';

export interface CachetUser {
  id: string;
  expiration: string;
  user: string;
  displayName: string;
  pronouns: string;
  image: string;
}

export async function POST(request: NextRequest) {
  try {
    const { slackId } = await request.json();

    if (!slackId) {
      return NextResponse.json(
        { error: 'Slack ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`https://cachet.dunkirk.sh/users/${slackId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch user data from Cachet' },
        { status: response.status }
      );
    }

    const userData: CachetUser = await response.json();
    
    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching Cachet user data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}