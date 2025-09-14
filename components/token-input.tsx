/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect } from 'react';
import { Key, LogIn, User, Star, Trophy, Github, Flame } from 'lucide-react';
import { ShibaProfile, CachetUser } from '../types';

interface TokenInputProps {
  onTokenChange?: (token: string | null) => void;
  games?: any[];
  analytics?: any;
  streak?: number;
}

export function TokenInput({ onTokenChange, games, analytics, streak }: TokenInputProps) {
  const [token, setToken] = useState<string>('');
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [profile, setProfile] = useState<ShibaProfile | null>(null);
  const [cachetUser, setCachetUser] = useState<CachetUser | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('shibaToken');
    if (saved) {
      setStoredToken(saved);
      onTokenChange?.(saved);
      fetchProfile(saved);
    }
  }, []);

  const fetchCachetUser = async (slackId: string) => {
    try {
      const response = await fetch('/api/cachet/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slackId }),
      });

      if (response.ok) {
        const userData = await response.json();
        setCachetUser(userData);
      }
    } catch (error) {
      console.error('Cachet user fetch error:', error);
    }
  };

  const fetchProfile = async (token: string) => {
    setLoadingProfile(true);
    try {
      const response = await fetch('/api/shiba/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Profile data received:', data);
        if (data.ok) {
          setProfile(data);
          if (data.profile?.slackId) {
            fetchCachetUser(data.profile.slackId);
          }
        }
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  const validateAndSaveToken = async () => {
    if (!token.trim()) return;
    
    console.log('Validating token...');
    setIsValidating(true);
    try {
      const response = await fetch('/api/shiba/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Token validation response:', data.ok ? 'valid' : 'invalid');
        if (data.ok) {
          localStorage.setItem('shibaToken', token.trim());
          setStoredToken(token.trim());
          setShowInput(false);
          setProfile(data);
          
          if (data.profile?.slackId) {
            fetchCachetUser(data.profile.slackId);
          }
          onTokenChange?.(token.trim());
        } else {
          alert('Invalid token. Please check and try again.');
        }
      } else {
        console.error('Token validation failed with status:', response.status);
        alert('Failed to validate token. Please try again.');
      }
    } catch (error) {
      console.error('Token validation error:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('shibaToken');
    setStoredToken(null);
    setToken('');
    setProfile(null);
    setCachetUser(null);
    onTokenChange?.(null);
  };

  const calculateTotalHours = () => {
    if (!games) return 0;
    return games.reduce((total, game) => {
      return total + game.posts.reduce((gameTotal: number, post: any) => gameTotal + (post.HoursSpent || 0), 0);
    }, 0);
  };

  const calculatePercentileRanking = (userHours: number) => {
    if (!analytics?.funnelData) return 0;
    const funnel = analytics.funnelData;
    const totalHackatimeUsers = funnel.connectedHackatime; 

    if (totalHackatimeUsers === 0) return 0;

    if (userHours >= 100) return parseFloat((((totalHackatimeUsers - funnel.logged100Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 90) return parseFloat((((totalHackatimeUsers - funnel.logged90Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 80) return parseFloat((((totalHackatimeUsers - funnel.logged80Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 70) return parseFloat((((totalHackatimeUsers - funnel.logged70Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 60) return parseFloat((((totalHackatimeUsers - funnel.logged60Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 50) return parseFloat((((totalHackatimeUsers - funnel.logged50Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 40) return parseFloat((((totalHackatimeUsers - funnel.logged40Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 30) return parseFloat((((totalHackatimeUsers - funnel.logged30Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 20) return parseFloat((((totalHackatimeUsers - funnel.logged20Hours) / totalHackatimeUsers) * 100).toFixed(1));
    if (userHours >= 10) return parseFloat((((totalHackatimeUsers - funnel.logged10Hours) / totalHackatimeUsers) * 100).toFixed(1));

    return 0;
  };

  if (storedToken && !showInput) {
    const totalHours = calculateTotalHours();
    const percentileRank = calculatePercentileRanking(totalHours);
    
    if (loadingProfile) {
      return (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center animate-pulse">
              <User className="w-6 h-6 text-slate-400" />
            </div>
            <div className="flex-1">
              <div className="h-5 bg-slate-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-3 bg-slate-200 rounded w-32 animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="relative bg-white/85 backdrop-blur-md rounded-2xl p-8 border border-slate-200/60 shadow-lg overflow-hidden">
        
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                {cachetUser?.image ? (
                  <img 
                    src={cachetUser.image} 
                    alt={cachetUser.displayName}
                    className="w-16 h-16 rounded-full border border-slate-300/30 object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center border border-slate-300/30">
                    <User className="w-8 h-8 text-slate-500" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white">
                  <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>
                </div>
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-xl mb-1">
                  Welcome back, {cachetUser?.displayName || profile?.profile?.firstName || 'Developer'}
                </div>
                <div className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
                  {cachetUser?.pronouns && (
                    <span className="text-xs bg-slate-100 px-2 py-1 rounded-full">
                      {cachetUser.pronouns}
                    </span>
                  )}
                  {profile?.profile?.githubUsername && (
                    <>
                      <Github className="w-4 h-4" />
                      <span>@{profile.profile.githubUsername}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowInput(true)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
              >
                Change Token
              </button>
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        
          
          {(games || analytics) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-200/30">
              <div className="text-center p-4 bg-gradient-to-b from-amber-50/50 to-amber-100/30 rounded-xl border border-amber-200/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-medium text-slate-600">SSS Balance</span>
                </div>
                <div className="text-2xl font-semibold text-slate-800">
                  {profile?.profile?.sssBalance !== undefined ? profile.profile.sssBalance.toLocaleString() : '–'}
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-b from-blue-50/50 to-blue-100/30 rounded-xl border border-blue-200/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-slate-600">
                    {percentileRank > 0 ? `Top ${percentileRank}%` : 'Hours Logged'}
                  </span>
                </div>
                <div className="text-2xl font-semibold text-slate-800">
                  {totalHours.toFixed(1)}h
                </div>
              </div>

              <div className="text-center p-4 bg-gradient-to-b from-orange-50/50 to-red-100/30 rounded-xl border border-orange-200/20">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className={`w-5 h-5 ${(streak || 0) > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
                  <span className="text-sm font-medium text-slate-600">Daily Streak</span>
                </div>
                <div className="text-2xl font-semibold text-slate-800">
                  {streak || 0} day{(streak || 0) !== 1 ? 's' : ''}
                </div>
                {(streak || 0) > 0 && (
                  <div className="text-xs text-orange-600 mt-1">
                    🔥 Keep it going!
                  </div>
                )}
              </div>
            </div>
          )}
          
          {percentileRank > 0 && (
            <div className="mt-6 text-center">
              <div className="text-sm text-slate-600 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 px-4 py-3 rounded-lg border border-blue-100/50 inline-block">
                You&apos;re in the top {(100 - percentileRank).toFixed(1)}% of Shiba users who setup Hackatime
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/50">
      <div className="flex flex-col items-center mb-4 text-center">
        <div className="w-10 h-10 bg-blue-100 rounded-full grid place-items-center mb-2">
          <Key className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <div className="font-semibold text-slate-800">Connect to Shiba</div>
          <div className="text-sm text-slate-500">Enter your token to access games</div>
        </div>
      </div>

      <div className="flex gap-3">
        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter your Shiba token..."
          className="flex-1 px-4 py-2 bg-white/50 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
          onKeyPress={(e) => e.key === 'Enter' && validateAndSaveToken()}
          disabled={isValidating}
        />
        <button
          onClick={validateAndSaveToken}
          disabled={!token.trim() || isValidating}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          {isValidating ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {isValidating ? 'Validating...' : 'Connect'}
        </button>
      </div>

      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 rounded-lg border border-blue-100/50">
        <div className="flex items-start gap-2">
          <div className="text-sm text-slate-600">
            <span className="font-medium text-slate-700">How to get your token:</span>
            <br />
            Go to <code className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-xs font-mono">shiba.hackclub.com</code> →
            <span className="mx-1">Open Developer Tools (F12)</span> →
            <span className="mx-1"><strong>Application</strong> tab</span> →
            <span className="mx-1"><strong>Local Storage</strong></span> →
            <span className="mx-1">Copy the <strong>token</strong> value</span>
          </div>
        </div>
      </div>

      {storedToken && showInput && (
        <button
          onClick={() => setShowInput(false)}
          className="mt-3 text-sm text-slate-500 hover:text-slate-700 transition-colors"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
