/* eslint-disable @typescript-eslint/no-explicit-any */
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
      
      const [gamesResponse, profileResponse, analyticsResponse, cachetResponse] = await Promise.all([
        
        fetch('https://shiba.hackclub.com/api/GetMyGames', {
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
        }),
        
        fetch('https://shiba.hackclub.com/api/getMyProfile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Referer': 'https://shiba.hackclub.com/my-games',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36',
          },
          body: JSON.stringify({ token }),
          signal: controller.signal,
        }),
        
        fetch(`${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://shiba.hridya.tech')}/api/analytics`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        }),
        
        Promise.resolve(null)
      ]);

      clearTimeout(timeoutId);

      
      const [gamesData, profileData, analyticsData] = await Promise.all([
        gamesResponse.ok ? gamesResponse.json() : null,
        profileResponse.ok ? profileResponse.json() : null,
        analyticsResponse.ok ? analyticsResponse.json() : null,
      ]);

      
      let cachetData = null;
      if (profileData?.profile?.slackId) {
        try {
          const cachetResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'https://shiba.hridya.tech')}/api/cachet/user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slackId: profileData.profile.slackId }),
            signal: controller.signal,
          });

          if (cachetResponse.ok) {
            cachetData = await cachetResponse.json();
          }
        } catch (error) {
          console.error('Cachet fetch failed:', error);
        }
      }

      
      const streak = calculateStreak(gamesData);

      return NextResponse.json({
        games: Array.isArray(gamesData) ? gamesData : [],
        profile: profileData,
        analytics: analyticsData,
        cachet: cachetData,
        streak,
        timestamp: Date.now()
      });

    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Dashboard API timeout');
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
      throw error;
    }
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}


function calculateStreak(gamesData: any[]): number {
  if (!Array.isArray(gamesData)) return 0;

  
  const allPosts: { date: string; created: Date }[] = [];

  gamesData.forEach(game => {
    if (game.posts && Array.isArray(game.posts)) {
      game.posts.forEach((post: any) => {
        if (post.createdAt || post["Created At"] || post.createdTime) {
          const dateStr = post.createdAt || post["Created At"] || post.createdTime;
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            allPosts.push({
              date: date.toISOString().split('T')[0], 
              created: date
            });
          }
        }
      });
    }
  });

  if (allPosts.length === 0) return 0;

  
  allPosts.sort((a, b) => b.created.getTime() - a.created.getTime());

  
  const uniqueDates = [...new Set(allPosts.map(post => post.date))].sort().reverse();

  if (uniqueDates.length === 0) return 0;

  
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let streak = 0;
  let currentDate = new Date();

  
  if (uniqueDates[0] === todayStr) {
    streak = 1;
    currentDate = today;
  } else if (uniqueDates[0] === yesterdayStr) {
    streak = 1;
    currentDate = yesterday;
  } else {
    return 0; 
  }

  
  for (let i = 1; i < uniqueDates.length; i++) {
    const expectedDate = new Date(currentDate);
    expectedDate.setDate(expectedDate.getDate() - 1);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    if (uniqueDates[i] === expectedDateStr) {
      streak++;
      currentDate = expectedDate;
    } else {
      break; 
    }
  }

  return streak;
}