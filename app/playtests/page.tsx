'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Navigation } from '../../components/navigation';
import { Playtest, PlaytestsResponse } from '../../types';
import {
  Play,
  Clock,
  Star,
  MessageSquare,
  Calendar,
  Trophy,
  Palette,
  Lightbulb,
  Volume2,
  Heart,
  ExternalLink,
  User,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';
import { GlowingStrokeRadarChart } from '../../components/ui/glowing-stroke-radar-chart';

export default function PlaytestsPage() {
  const [playtests, setPlaytests] = useState<Playtest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchPlaytests = async () => {
      const token = localStorage.getItem('shibaToken');
      if (!token) {
        router.push('/');
        return;
      }

      try {
        const response = await fetch('/api/shiba/playtests', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data: PlaytestsResponse = await response.json();
          if (data.ok) {
            setPlaytests(data.playtests);
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Failed to fetch playtests:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    fetchPlaytests();
  }, [router]);

  const getScoreIcon = (category: string) => {
    switch (category) {
      case 'fun': return <Trophy className="w-4 h-4" />;
      case 'art': return <Palette className="w-4 h-4" />;
      case 'creativity': return <Lightbulb className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      case 'mood': return <Heart className="w-4 h-4" />;
      default: return <Star className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-green-600 bg-green-50';
    if (score >= 3) return 'text-blue-600 bg-blue-50';
    if (score >= 2) return 'text-yellow-600 bg-yellow-50';
    if (score >= 1) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const formatPlaytime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRadarData = (playtest: Playtest) => {
    return [
      { metric: 'Fun', score: playtest.funScore },
      { metric: 'Art', score: playtest.artScore },
      { metric: 'Creativity', score: playtest.creativityScore },
      { metric: 'Audio', score: playtest.audioScore },
      { metric: 'Mood', score: playtest.moodScore },
    ];
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iI2E1NTVmNyIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>

        <Navigation />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="space-y-6">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-white/60 rounded-2xl p-6 border">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-slate-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-6 bg-slate-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
                      <div className="flex gap-2">
                        {Array(5).fill(0).map((_, j) => (
                          <div key={j} className="w-16 h-8 bg-slate-200 rounded"></div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iI2E1NTVmNyIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>

      <Navigation />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">My Playtests</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Games you&apos;ve tested.
          </p>
        </div>

        {playtests.length > 0 && (
          <div className="mb-12 bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center flex items-center justify-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Testing Summary
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{playtests.length}</div>
                <div className="text-sm text-slate-600">Games Tested</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(playtests.reduce((sum, p) => sum + p.playtimeSeconds, 0) / 60)}m
                </div>
                <div className="text-sm text-slate-600">Total Playtime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-emerald-600 mb-2">
                  {Math.round(playtests.reduce((sum, p) => sum + p.playtimeSeconds, 0) / playtests.length / 60)}m
                </div>
                <div className="text-sm text-slate-600">Avg Playtime</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {(playtests.reduce((sum, p) => sum + (p.funScore + p.artScore + p.creativityScore + p.audioScore + p.moodScore), 0) / (playtests.length * 5)).toFixed(1)}
                </div>
                <div className="text-sm text-slate-600">Avg Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">
                  {playtests.reduce((sum, p) => sum + p.HoursSpent[0], 0).toFixed(1)}h
                </div>
                <div className="text-sm text-slate-600">Dev Hours Tested</div>
              </div>
            </div>
          </div>
        )}

        {playtests.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Play className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">No Playtests Yet</h3>
            <p className="text-slate-500">Start testing games to see your feedback history here!</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {playtests.map((playtest) => (
              <div key={playtest.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex gap-6">
                  
                  <div className="flex-shrink-0">
                    <div className="relative w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden">
                      {playtest.gameThumbnail ? (
                        <img
                          src={playtest.gameThumbnail}
                          alt={playtest.gameName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-5 h-5 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-slate-800 mb-1">{playtest.gameName}</h2>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(playtest.createdAt)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatPlaytime(playtest.playtimeSeconds)}
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {playtest.HoursSpent[0]?.toFixed(1)}h dev
                          </div>
                        </div>
                      </div>

                      {playtest.gameLink[0] && (
                        <a
                          href={playtest.gameLink[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                        >
                          <Play className="w-3 h-3" />
                          Play
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    
                    <div className="flex gap-4 mb-4">
                      
                      <div className="flex-1">
                        <div className="grid grid-cols-5 gap-2">
                          {[
                            { key: 'fun', label: 'Fun', score: playtest.funScore },
                            { key: 'art', label: 'Art', score: playtest.artScore },
                            { key: 'creativity', label: 'Creativity', score: playtest.creativityScore },
                            { key: 'audio', label: 'Audio', score: playtest.audioScore },
                            { key: 'mood', label: 'Mood', score: playtest.moodScore },
                          ].map((category) => (
                            <div
                              key={category.key}
                              className={`flex items-center gap-1 px-2 py-2 rounded-lg text-xs ${getScoreColor(category.score)}`}
                            >
                              {getScoreIcon(category.key)}
                              <div>
                                <div className="font-semibold">{category.label}</div>
                                <div className="opacity-75">{category.score}/5</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      
                      <div className="w-28 h-28 flex-shrink-0">
                        <GlowingStrokeRadarChart
                          data={getRadarData(playtest)}
                          className="w-full h-full"
                          width={112}
                          height={112}
                          isMiniature={true}
                          borderColor="rgba(139, 92, 246, 1)"
                          pointBackgroundColor="rgba(139, 92, 246, 1)"
                          pointBorderColor="rgba(255, 255, 255, 1)"
                        />
                      </div>
                    </div>

                    
                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200/50">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                        <h3 className="font-semibold text-slate-800 text-sm">Feedback</h3>
                      </div>
                      <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap">{playtest.feedback}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}