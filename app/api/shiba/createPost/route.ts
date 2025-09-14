/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';

const SHIBA_API_BASE = process.env.SHIBA_API_BASE || 'https://shiba.hackclub.com/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      token, 
      gameId, 
      content, 
      attachmentsUpload, 
      playLink,
      postType,
      timelapseVideoId,
      githubImageLink,
      timeScreenshotId,
      hoursSpent,
      minutesSpent
    } = body;

    if (!token || !gameId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: token, gameId, content' },
        { status: 400 }
      );
    }

    const shibaPayload: any = {
      token,
      gameId,
      content: content.trim(),
      attachmentsUpload,
      playLink
    };

    if (postType === 'artlog') {
      shibaPayload.postType = 'artlog';
      shibaPayload.timelapseVideoId = timelapseVideoId;
      shibaPayload.githubImageLink = githubImageLink;
      shibaPayload.timeScreenshotId = timeScreenshotId;
      shibaPayload.hoursSpent = parseFloat(hoursSpent.toString()) || 0;
      shibaPayload.minutesSpent = parseFloat(minutesSpent.toString()) || 0;
    }

    const response = await fetch(`${SHIBA_API_BASE}/createPost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ShibaClient/1.0'
      },
      body: JSON.stringify(shibaPayload)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.message || 'Failed to create post',
          details: data.details || null
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      ok: true,
      post: {
        id: data.post?.id,
        PostID: data.post?.PostID,
        content: data.post?.content,
        createdAt: data.post?.createdAt,
        PlayLink: data.post?.PlayLink,
        attachments: data.post?.attachments || [],
        badges: data.post?.badges || [],
        postType: postType || 'devlog',
        timelapseVideoId: data.post?.timelapseVideoId,
        githubImageLink: data.post?.githubImageLink,
        timeScreenshotId: data.post?.timeScreenshotId,
        hoursSpent: data.post?.hoursSpent,
        minutesSpent: data.post?.minutesSpent
      }
    });

  } catch (error) {
    console.error('Create post API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}