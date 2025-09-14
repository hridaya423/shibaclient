/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState, useRef } from 'react';
import { Navigation } from '../../components/navigation';
import { CachetUser } from '../../types';
import { 
  Play, 
  Clock, 
  Calendar, 
  User, 
  Image as ImageIcon, 
  Video, 
  FileText,
  Github,
  ExternalLink,
  Gamepad2
} from 'lucide-react';

interface PostAttachment {
  url: string;
  type: string;
  filename: string;
  id: string;
  size: number;
}

interface FeedPost {
  id: string;
  createdAt: string;
  playLink: string;
  attachments: PostAttachment[];
  slackId: string;
  gameName: string;
  content: string;
  postId: string;
  gameThumbnail: string;
  badges: string[];
  postType: 'devlog' | 'ship' | 'artlog';
  timelapseVideoId: string;
  githubImageLink: string;
  timeScreenshotId: any;
  hoursSpent: number;
  minutesSpent: number;
  timeSpentOnAsset: number;
}

function PostTypeIcon({ postType }: { postType: string }) {
  const iconClass = "w-4 h-4";
  
  switch (postType) {
    case 'ship':
      return <Play className={`${iconClass} text-green-600`} />;
    case 'artlog':
      return <ImageIcon className={`${iconClass} text-purple-600`} />;
    default:
      return <FileText className={`${iconClass} text-blue-600`} />;
  }
}

function PostTypeLabel({ postType }: { postType: string }) {
  const baseClass = "px-2 py-1 text-xs font-medium rounded-full";
  
  switch (postType) {
    case 'ship':
      return <span className={`${baseClass} bg-green-100 text-green-700`}>Demo</span>;
    case 'artlog':
      return <span className={`${baseClass} bg-purple-100 text-purple-700`}>Artlog</span>;
    default:
      return <span className={`${baseClass} bg-blue-100 text-blue-700`}>Devlog</span>;
  }
}

function MediaAttachment({ attachment, index }: { attachment: PostAttachment; index: number }) {
  const isImage = attachment.type.startsWith('image/');
  const isVideo = attachment.type.startsWith('video/');

  if (isImage) {
    return (
      <div className="relative">
        <img
          src={attachment.url}
          alt={attachment.filename || `Attachment ${index + 1}`}
          className="w-full max-h-96 object-cover rounded-lg"
          loading="lazy"
        />
      </div>
    );
  }

  if (isVideo) {
    return (
      <div className="relative">
        <video
          src={attachment.url}
          className="w-full max-h-96 object-cover rounded-lg"
          controls
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-100 rounded-lg">
      <FileText className="w-5 h-5 text-slate-500" />
      <span className="text-sm text-slate-700 truncate">{attachment.filename || 'Unknown file'}</span>
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ml-auto text-blue-600 hover:text-blue-800"
      >
        <ExternalLink className="w-4 h-4" />
      </a>
    </div>
  );
}

function PostCard({ post, userCache }: { post: FeedPost; userCache: Map<string, CachetUser> }) {
  const [gameLoaded, setGameLoaded] = useState(false);
  
  const formatTime = (hours: number): string => {
    if (hours === 0) return '';
    const h = Math.floor(hours);
    const m = Math.floor((hours - h) * 60);
    if (h > 0) {
      return m > 0 ? `${h}h ${m}m` : `${h}h`;
    }
    return `${m}m`;
  };

  const formatTimeSpent = (post: FeedPost): string => {
    if (post.postType === 'artlog' && post.timeSpentOnAsset > 0) {
      return formatTime(post.timeSpentOnAsset);
    }
    if (post.hoursSpent > 0) {
      return formatTime(post.hoursSpent);
    }
    return '';
  };

  const user = userCache.get(post.slackId);
  
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 p-4 shadow-lg hover:shadow-xl transition-shadow">
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
            {user?.image ? (
              <img 
                src={user.image}
                alt={user.displayName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : post.gameThumbnail ? (
              <img 
                src={post.gameThumbnail}
                alt={post.gameName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <Gamepad2 className="w-4 h-4 text-slate-500" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600 truncate">
                {user?.displayName || 'Anonymous'}
              </span>
              <span className="text-slate-400">•</span>
              <h3 className="font-semibold text-slate-800 truncate">{post.gameName}</h3>
              <PostTypeLabel postType={post.postType} />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(post.createdAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              {formatTimeSpent(post) && (
                <>
                  <Clock className="w-3 h-3 ml-1" />
                  <span>{formatTimeSpent(post)}</span>
                </>
              )}
              {post.badges.map((badge, i) => (
                <span
                  key={i}
                  className="px-1 py-0.5 bg-amber-100 text-amber-700 text-[10px] rounded-full font-medium"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <PostTypeIcon postType={post.postType} />
        </div>
      </div>
      
      <div className="mb-4">
        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{post.content}</p>
      </div>

      {post.postType === 'artlog' && (
        <div className="mb-4 space-y-2">
          {post.timelapseVideoId && (
            <div className="flex items-center gap-2 text-sm">
              <Video className="w-4 h-4 text-purple-600" />
              <a
                href={post.timelapseVideoId}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                Timelapse Video
              </a>
            </div>
          )}
          {post.githubImageLink && (
            <div className="flex items-center gap-2 text-sm">
              <Github className="w-4 h-4 text-purple-600" />
              <a
                href={post.githubImageLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-800 underline"
              >
                GitHub Asset
              </a>
            </div>
          )}
        </div>
      )}

      
      {post.attachments && post.attachments.length > 0 && (
        <div className="mb-4 space-y-3">
          {post.attachments.map((attachment, i) => (
            <MediaAttachment key={i} attachment={attachment} index={i} />
          ))}
        </div>
      )}

      
      {post.playLink && (
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-2">
            {post.postType === 'ship' ? 'Demo:' : 'Play:'}
          </p>
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            {!gameLoaded ? (
              <div 
                onClick={() => setGameLoaded(true)}
                className="w-full h-96 flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300 group"
              >
                <div className="relative mb-4">
                  <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Play className="w-8 h-8 text-blue-600 ml-1" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-full bg-blue-200/30 animate-ping"></div>
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">{post.gameName}</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Click to {post.postType === 'ship' ? 'play demo' : 'start game'}
                </p>
              </div>
            ) : (
              <iframe
                src={post.playLink}
                className="w-full h-96 border-0"
                title={`${post.postType === 'ship' ? 'Demo' : 'Play'}: ${post.gameName}`}
                allow="autoplay; fullscreen; microphone; camera"
              />
            )}
          </div>
          <div className="mt-2 flex justify-between items-center text-xs text-slate-500">
            <span>{post.postType === 'ship' ? 'Interactive demo' : 'Playable game'}</span>
            <div className="flex items-center gap-3">
              {gameLoaded && (
                <button 
                  onClick={() => setGameLoaded(false)}
                  className="text-slate-600 hover:text-slate-800"
                >
                  ✕ Close game
                </button>
              )}
              <a 
                href={post.playLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                Open in new tab →
              </a>
            </div>
          </div>
        </div>
      )}

      {post.postType === 'artlog' && Array.isArray(post.timeScreenshotId) && post.timeScreenshotId.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-slate-700 mb-2">Time Screenshot:</p>
          {post.timeScreenshotId.map((screenshot: any, i: number) => (
            <img
              key={i}
              src={screenshot.url}
              alt="Time screenshot"
              className="w-full max-h-48 object-contain rounded-lg border"
              loading="lazy"
            />
          ))}
        </div>
      )}

      
    </div>
  );
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userCache, setUserCache] = useState<Map<string, CachetUser>>(new Map());

  const fetchUserData = async (slackId: string): Promise<CachetUser | null> => {
    if (!slackId || userCache.has(slackId)) {
      return userCache.get(slackId) || null;
    }

    try {
      const response = await fetch('/api/cachet/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slackId }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUserCache(prev => new Map(prev).set(slackId, userData));
        return userData;
      }
    } catch (error) {
      console.error('Failed to fetch user data for', slackId, error);
    }

    return null;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/shiba/getAllPosts?limit=100');
        
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }
        
        const data = await response.json();
        setPosts(data);

        
        const uniqueSlackIds = [...new Set(data.map((post: FeedPost) => post.slackId).filter(Boolean))] as string[];
        await Promise.all(uniqueSlackIds.map(slackId => fetchUserData(slackId)));
        
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iIzk0YTNiOCIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>
        <Navigation />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="bg-white/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-slate-200 rounded w-32 mb-1"></div>
                      <div className="h-2 bg-slate-200 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="h-3 bg-slate-200 rounded w-full"></div>
                    <div className="h-3 bg-slate-200 rounded w-3/4"></div>
                  </div>
                  <div className="h-24 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iIzk0YTNiOCIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>
        <Navigation />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">Community Feed</h1>
            <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iIzk0YTNiOCIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      <Navigation />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Community Feed</h1>
          <p className="text-slate-600">Latest updates from Shiba game developers</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.map((post) => (
            <PostCard key={post.postId} post={post} userCache={userCache} />
          ))}
          
          {posts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Posts Yet</h3>
              <p className="text-slate-500">Be the first to share your development progress!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}