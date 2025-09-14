/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState, useRef } from 'react';
import { Game, GamePost } from '../../types';
import { TokenInput } from '../../components/token-input';
import { Navigation } from '../../components/navigation';
import Link from 'next/link';
import { 
  Play, 
  Github, 
  Clock,
  MessageSquare, 
  Calendar,
  ExternalLink,
  Gamepad2,
  Eye,
  FileText,
  Video
} from 'lucide-react';

function calculateTotalHours(posts: GamePost[]): number {
  return posts.reduce((total, post) => total + (post.HoursSpent || 0), 0);
}

function getLatestPlayLink(posts: GamePost[]): string | null {
  const playPosts = posts.filter(post => post.PlayLink).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return playPosts.length > 0 ? playPosts[0].PlayLink : null;
}

export default function Games() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [hasLoadedInitialToken, setHasLoadedInitialToken] = useState(false);
  const [analytics, setAnalytics] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [cachet, setCachet] = useState<any>(null);
  const [streak, setStreak] = useState<number>(0);

  const fetchDashboard = async (token: string) => {
    if (loading) return;

    console.log('Fetching dashboard with token:', token.substring(0, 10) + '...');
    setLoading(true);
    try {
      const response = await fetch('/api/shiba/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Dashboard data received:', data.games?.length || 0, 'games');

        setGames(data.games || []);
        setAnalytics(data.analytics);
        setProfile(data.profile);
        setCachet(data.cachet);
        setStreak(data.streak || 0);
      } else {
        console.error('Failed to fetch dashboard, status:', response.status);
        setGames([]);
        setAnalytics(null);
        setProfile(null);
        setCachet(null);
        setStreak(0);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setGames([]);
      setAnalytics(null);
      setProfile(null);
      setCachet(null);
      setStreak(0);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    const savedToken = localStorage.getItem('shibaToken');
    if (savedToken && !hasLoadedInitialToken) {
      console.log('Loading saved token');
      setToken(savedToken);
      setHasLoadedInitialToken(true);
    }
  }, [hasLoadedInitialToken]);

  
  useEffect(() => {
    if (token && hasLoadedInitialToken) {
      console.log('Token changed, fetching dashboard');
      fetchDashboard(token);
    } else if (!token && hasLoadedInitialToken) {
      console.log('Token cleared, clearing data');
      setGames([]);
      setAnalytics(null);
      setProfile(null);
      setCachet(null);
      setStreak(0);
    }
  }, [token, hasLoadedInitialToken]);

  const handleTokenChange = (newToken: string | null) => {
    console.log('Token change requested:', newToken ? 'new token' : 'logout');
    setToken(newToken);
    if (!hasLoadedInitialToken) {
      setHasLoadedInitialToken(true);
    }
  };


  const formatTime = (seconds: number | { specialValue: "NaN" }): string => {
    if (typeof seconds === 'object' && seconds.specialValue === "NaN") {
      return "N/A";
    }
    if (typeof seconds !== 'number') return "N/A";
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50/90 via-blue-50/80 to-indigo-50/70 relative">
      
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      ></div>
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjMwIiBjeT0iMzAiIHI9IjEiIGZpbGw9IiM5NGEzYjgiIG9wYWNpdHk9IjAuMTIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZG90KSIvPjwvc3ZnPg==')] opacity-60"></div>
      
      <Navigation />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        
        <div className="text-center mb-16">
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight text-slate-800 mb-6">
              My Games
            </h1>
          </div>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-light">
            Your games. Check out the stats!
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-8">
          <TokenInput
            onTokenChange={handleTokenChange}
            games={games}
            analytics={analytics}
            streak={streak}
          />
        </div>

        {token && (
          <>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/60 animate-pulse">
                    <div className="h-56 bg-slate-200 rounded-lg mb-6"></div>
                    <div className="h-7 bg-slate-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6 mb-6"></div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                      <div className="h-16 bg-slate-200 rounded-lg"></div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-10 bg-slate-200 rounded-lg flex-1"></div>
                      <div className="h-10 bg-slate-200 rounded-lg flex-1"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !loading && games.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {games.map((game) => (
                  <div key={game.id} className="group bg-white/85 backdrop-blur-md rounded-2xl border border-white/60 hover:bg-white/95 hover:border-blue-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                    <div className="relative h-56 bg-gradient-to-br from-slate-100 to-slate-200">
                      {game.thumbnailUrl ? (
                        <img 
                          src={game.thumbnailUrl} 
                          alt={game.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Gamepad2 className="w-20 h-20 text-slate-400" />
                        </div>
                      )}

                      
                      {getLatestPlayLink(game.posts) && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <a
                            href={getLatestPlayLink(game.posts)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white/90 hover:bg-white rounded-full p-5 transition-all duration-200 hover:scale-110 shadow-lg"
                          >
                            <Play className="w-10 h-10 text-slate-800 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{game.name}</h3>
                      <p className="text-slate-600 text-sm mb-4 line-clamp-3 leading-relaxed">{game.description}</p>

                      
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-lg">
                          <Clock className="w-4 h-4 text-blue-500" />
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-slate-800">{calculateTotalHours(game.posts).toFixed(1)}h</span>
                            <span className="text-xs text-slate-500">Hours Spent</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-lg">
                          <MessageSquare className="w-4 h-4 text-green-500" />
                          <div className="flex flex-col">
                            <span className="text-lg font-semibold text-slate-800">{game.numberComplete}</span>
                            <span className="text-xs text-slate-500">Reviews</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-50/50 rounded-lg">
                          <Eye className="w-4 h-4 text-purple-500" />
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-slate-800">{formatTime(game.AveragePlaytestSeconds)}</span>
                            <span className="text-xs text-slate-500">Avg Play</span>
                          </div>
                        </div>
                      </div>

                      
                      <div className="flex gap-2 mb-4">
                        {game.GitHubURL && (
                          <a
                            href={game.GitHubURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex-1 justify-center"
                          >
                            <Github className="w-4 h-4" />
                            Code
                          </a>
                        )}
                        {getLatestPlayLink(game.posts) && (
                          <a
                            href={getLatestPlayLink(game.posts)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-medium transition-all duration-200 hover:shadow-md flex-1 justify-center"
                          >
                            <Play className="w-4 h-4" />
                            Play
                          </a>
                        )}
                      </div>

                      
                      <div className="border-t border-slate-200 pt-2">
                        <Link
                          href={`/games/${game.id}`}
                          className="flex items-center justify-between w-full text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
                        >
                          <span>Details & Devlogs ({game.posts.length})</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>


                    {selectedGame === game.id && (
                      <div className="border-t border-slate-200 bg-slate-50/50">
                        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                          {game.posts.map((post) => (
                            <div key={post.id} className="bg-white/60 rounded-lg p-3 border border-white/30">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(post.createdAt).toLocaleDateString()}
                                  {post.HoursSpent > 0 && (
                                    <>
                                      <Clock className="w-3 h-3" />
                                      {post.HoursSpent.toFixed(1)}h
                                    </>
                                  )}
                                </div>
                                {post.badges.length > 0 && (
                                  <div className="flex gap-1">
                                    {post.badges.slice(0, 2).map((badge, i) => (
                                      <span key={i} className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded font-medium">
                                        {badge}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm text-slate-700 mb-2">{post.content}</p>
                              <div className="flex gap-2">
                                {post.PlayLink && (
                                  <a
                                    href={post.PlayLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                  >
                                    Play →
                                  </a>
                                )}
                                {post.attachments && post.attachments.length > 0 && (
                                  <span className="text-xs text-slate-500">
                                    {post.attachments.some(a => a.type.startsWith('video/')) ? (
                                      <Video className="w-3 h-3 inline" />
                                    ) : (
                                      <FileText className="w-3 h-3 inline" />
                                    )}
                                    {post.attachments.length} file(s)
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-24">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-16 max-w-lg mx-auto border border-slate-200/50 shadow-lg relative overflow-hidden">
                  <div 
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
                    }}
                  ></div>
                  
                  <div className="relative z-10">
                    <div className="mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-300/30">
                        <Gamepad2 className="w-12 h-12 text-slate-400" />
                      </div>
                    </div>
                    <h3 className="text-3xl font-light text-slate-700 mb-6">Ready to Begin</h3>
                    <p className="text-slate-600 mb-8 leading-relaxed text-lg font-light">
                      Your creative space awaits that first project. 
                      Every great developer started with a single game.
                    </p>
                    <div className="text-sm text-slate-500 bg-slate-50/50 px-6 py-3 rounded-full inline-block border border-slate-200/30">
                      Create your first game to get started
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}