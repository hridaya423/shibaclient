'use client';

import { useEffect, useState } from 'react';
import { ShibaAnalytics } from '../types';
import { ChartSkeleton, StatsSkeleton } from '../components/skeleton';
import { Navigation } from '../components/navigation';
import { TokenInput } from '../components/token-input';
import TextPressure from '../components/TextPressure';
import { ClippedAreaChart } from '../components/ui/clipped-area-chart';
import { IncreaseSizePieChart } from '../components/ui/increase-size-pie-chart';
import { ValueLineBarChart } from '../components/ui/value-line-bar-chart';
import { PartialLineChart } from '../components/ui/partial-line';
import Link from 'next/link';


export default function Home() {
  const [analytics, setAnalytics] = useState<ShibaAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch analytics:', err);
        setLoading(false);
      });
  }, []);


  const todayHours = analytics?.hoursPerDay?.[analytics.hoursPerDay?.length - 1]?.hours || 0;
  const pendingReviews = analytics ? 
    (analytics.reviewBacklog?.data?.find(item => item.label === "Needs Review")?.value || 0) +
    (analytics.reviewBacklog?.data?.find(item => item.label === "Needs Rereview")?.value || 0) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iI2ZiN2EzNSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      <Navigation />
      
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16">
          <div className="text-center">
            <div style={{ position: 'relative', height: '200px', marginBottom: '1rem' }}>
              <TextPressure
                text="SHIBA"
                flex={false}
                alpha={false}
                stroke={false}
                width={true}
                weight={true}
                italic={false}
                scale={true}
                textColor="#be185d"
                minFontSize={56}
                fontFamily="Compressa VF"
                fontUrl="https://res.cloudinary.com/dr6lvwubh/raw/upload/v1529908256/CompressaPRO-GX.woff2"
                className="tracking-tight"
              />
            </div>
            
            <p className="text-lg sm:text-xl font-medium text-slate-600 mb-8 max-w-2xl mx-auto">
              Analytics dashboard for the Shiba Arcade
            </p>
            <div className="max-w-2xl mx-auto mb-8">
              <TokenInput />
            </div>

            <div className="flex justify-center gap-4 mb-8">
              <Link
                href="/games"
                className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors font-medium flex items-center gap-2 shadow-lg mx-auto"
              >
                View My Games
              </Link>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {loading ? (
                Array(4).fill(0).map((_, i) => <StatsSkeleton key={i} />)
              ) : (
                <>
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-pink-200/50 hover:bg-white/80 transition-all duration-200 shadow-lg">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums">
                      {analytics?.signupData?.totalSignups?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Total Signups</div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-pink-200/50 hover:bg-white/80 transition-all duration-200 shadow-lg">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums">
                      {analytics?.funnelData?.onboarded?.toLocaleString() || '0'}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Onboarded</div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-pink-200/50 hover:bg-white/80 transition-all duration-200 shadow-lg">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums">
                      {todayHours.toFixed(1)}h
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Hours Today</div>
                  </div>
                  
                  <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-pink-200/50 hover:bg-white/80 transition-all duration-200 shadow-lg">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 tabular-nums">
                      {pendingReviews.toLocaleString()}
                    </div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Reviews Pending</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-16">
              <h2 className="text-2xl font-bold text-slate-800 mb-8 text-center">Detailed Analytics</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">  
                {loading ? (
                  Array(2).fill(0).map((_, i) => <ChartSkeleton key={i} />)
                ) : (
                  <>
                    <ClippedAreaChart data={analytics?.hoursPerDay || []} />
                    
                    <ValueLineBarChart 
                      data={analytics?.funnelData}
                      title="User Funnel" 
                      description="User progression through onboarding"
                      type="funnel"
                    />
                  </>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {loading ? (
                  Array(2).fill(0).map((_, i) => <ChartSkeleton key={i} />)
                ) : (
                  <>
                    <IncreaseSizePieChart
                      data={analytics?.reviewBacklog?.data || []}
                      description="Review status breakdown"
                    />

                    <IncreaseSizePieChart
                      data={[
                        { label: "Hack Club Community", value: analytics?.signupData?.hackClubCommunity || 0, color: "#22c55e" },
                        { label: "Referrals", value: analytics?.signupData?.referrals || 0, color: "#a855f7" },
                      ]}
                      title="Signup Sources"
                      description="User acquisition channels"
                    />
                  </>
                )}
              </div>

              
              <div className="grid grid-cols-1 gap-8">
                {loading ? (
                  <ChartSkeleton />
                ) : (
                  <PartialLineChart 
                    hoursData={analytics?.hoursPerDay || []}
                    activeUsersData={analytics?.dailyActiveUsers || []}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-20">
      </div>

      
      <footer className="bg-white/50 backdrop-blur-sm border-t border-pink-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-slate-500">
            <p className="text-sm font-medium">Client for Shiba</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
