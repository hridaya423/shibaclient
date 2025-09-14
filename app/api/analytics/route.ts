import { NextResponse } from 'next/server';
import { ShibaAnalytics } from '../../../types';

let cachedData: ShibaAnalytics | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 2 * 60 * 1000; 
export async function GET() {
  try {
    const now = Date.now();
    if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedData);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const fetchOptions = {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      }
    };

    const [funnelResponse, hoursResponse, backlogResponse, signupResponse, activeUsersResponse] = await Promise.all([
      fetch('https://shiba.hackclub.com/api/analytics/getFunnelData', fetchOptions),
      fetch('https://shiba.hackclub.com/api/analytics/getHoursPerDay', fetchOptions),
      fetch('https://shiba.hackclub.com/api/analytics/getReviewBacklog', fetchOptions),
      fetch('https://shiba.hackclub.com/api/analytics/getShibaSignupData', fetchOptions),
      fetch('https://shiba.hackclub.com/api/analytics/getDailyActiveUsers', fetchOptions),
    ]);

    clearTimeout(timeoutId);

    if (!funnelResponse.ok || !hoursResponse.ok || !backlogResponse.ok || !signupResponse.ok || !activeUsersResponse.ok) {
      throw new Error('One or more API endpoints failed');
    }

    const [funnelData, hoursPerDay, reviewBacklog, signupData, dailyActiveUsers] = await Promise.all([
      funnelResponse.json(),
      hoursResponse.json(),
      backlogResponse.json(),
      signupResponse.json(),
      activeUsersResponse.json(),
    ]);

    const analytics: ShibaAnalytics = {
      funnelData,
      hoursPerDay,
      reviewBacklog,
      signupData,
      dailyActiveUsers,
    };

    cachedData = analytics;
    cacheTimestamp = now;

    return NextResponse.json(analytics, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=240',
      },
    });
  } catch (error) {
    if (cachedData) {
      return NextResponse.json(cachedData, {
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      });
    }

    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}