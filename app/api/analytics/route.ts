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
  
    const responses = [
      { name: 'funnel', response: funnelResponse },
      { name: 'hours', response: hoursResponse },
      { name: 'backlog', response: backlogResponse },
      { name: 'signup', response: signupResponse },
      { name: 'activeUsers', response: activeUsersResponse }
    ];

    const failedEndpoints = responses.filter(r => !r.response.ok);
    if (failedEndpoints.length > 0) {
      console.warn('Some analytics endpoints failed:', failedEndpoints.map(r => r.name));
    }

    if (failedEndpoints.length === responses.length) {
      throw new Error('All analytics endpoints failed');
    }

    const [funnelData, hoursPerDay, reviewBacklog, signupData, dailyActiveUsers] = await Promise.all([
      funnelResponse.ok ? funnelResponse.json() : null,
      hoursResponse.ok ? hoursResponse.json() : null,
      backlogResponse.ok ? backlogResponse.json() : null,
      signupResponse.ok ? signupResponse.json() : null,
      activeUsersResponse.ok ? activeUsersResponse.json() : null,
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