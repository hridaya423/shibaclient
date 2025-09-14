import { NextRequest, NextResponse } from 'next/server';

const SHIBA_API_BASE = process.env.SHIBA_API_BASE || 'https://shiba.hackclub.com/api';

interface PostAttachment {
  url: string;
  type: string;
  filename: string;
  id: string;
  size: number;
}

interface TimeScreenshot {
  id: string;
  width: number;
  height: number;
  url: string;
  filename: string;
  size: number;
  type: string;
  thumbnails?: {
    small?: { url: string; width: number; height: number };
    large?: { url: string; width: number; height: number };
    full?: { url: string; width: number; height: number };
  };
}

export interface GlobalPost {
  'Created At': string;
  PlayLink: string;
  Attachements: PostAttachment[];
  'slack id': string;
  'Game Name': string;
  Content: string;
  PostID: string;
  GameThumbnail: string;
  Badges: string[];
  postType: 'devlog' | 'ship' | 'artlog';
  timelapseVideoId: string;
  githubImageLink: string;
  timeScreenshotId: TimeScreenshot[] | string;
  hoursSpent: number;
  minutesSpent: number;
  timeSpentOnAsset: number;
  posterShomatoSeeds: number[];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '100';

    const response = await fetch(`${SHIBA_API_BASE}/GetAllPosts?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ShibaClient/1.0'
      }
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch posts from Shiba API' },
        { status: response.status }
      );
    }

    const posts: GlobalPost[] = await response.json();

    const transformedPosts = posts.map(post => ({
      id: post.PostID,
      createdAt: post['Created At'],
      playLink: post.PlayLink,
      attachments: post.Attachements || [],
      slackId: post['slack id'],
      gameName: post['Game Name'],
      content: post.Content,
      postId: post.PostID,
      gameThumbnail: post.GameThumbnail,
      badges: post.Badges || [],
      postType: post.postType || 'devlog',
      timelapseVideoId: post.timelapseVideoId || '',
      githubImageLink: post.githubImageLink || '',
      timeScreenshotId: post.timeScreenshotId || '',
      hoursSpent: post.hoursSpent || 0,
      minutesSpent: post.minutesSpent || 0,
      timeSpentOnAsset: post.timeSpentOnAsset || 0
    }));

    return NextResponse.json(transformedPosts);

  } catch (error) {
    console.error('Get all posts API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}