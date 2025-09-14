/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useEffect, useState, use, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Game, GamePost } from '../../../types';
import { Navigation } from '../../../components/navigation';
import { 
  ArrowLeft, 
  Play, 
  Github, 
  Clock, 
  Star, 
  MessageSquare, 
  Calendar,
  Gamepad2,
  Eye,
  FileText,
  Video,
  Download,
  Trophy,
  TrendingUp,
  Users,
  BarChart3,
  Upload,
  Image,
  X,
  Send
 } from 'lucide-react';
import Link from 'next/link';

import { GlowingStrokeRadarChart } from '@/components/ui/glowing-stroke-radar-chart';

interface GamePageProps {
  params: Promise<{ id: string }>;
}



function EmbeddedAttachment({ attachment, index }: { attachment: any; index: number }) {
  if (attachment.type.startsWith('video/')) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
          <Video className="w-4 h-4" />
          <span>{attachment.filename || `Video ${index + 1}`}</span>
        </div>
        <video
          controls
          className="w-full max-w-2xl rounded-lg shadow-sm"
          preload="metadata"
        >
          <source src={attachment.url} type={attachment.type} />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  }

  if (attachment.type.startsWith('image/')) {
    return (
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2 text-sm text-slate-600">
          <FileText className="w-4 h-4" />
          <span>{attachment.filename || `Image ${index + 1}`}</span>
        </div>
        <img
          src={attachment.url}
          alt={attachment.filename || `Attachment ${index + 1}`}
          className="max-w-full max-h-96 rounded-lg shadow-sm object-contain"
          loading="lazy"
        />
      </div>
    );
  }
  
  return (
    <div className="mb-2">
      <a
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors inline-flex"
      >
        <Download className="w-4 h-4" />
        {attachment.filename || `Download ${index + 1}`}
      </a>
    </div>
  );
}

export default function GamePage({ params }: GamePageProps) {
  const resolvedParams = use(params);
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  
  const [postType, setPostType] = useState<'devlog' | 'ship' | 'artlog'>('devlog');
  const [postContent, setPostContent] = useState('');
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [postMessage, setPostMessage] = useState('');
  
  
  const [timelapseVideoId, setTimelapseVideoId] = useState('');
  const [githubImageLink, setGithubImageLink] = useState('');
  const [timeScreenshotId, setTimeScreenshotId] = useState('');
  const [hoursSpent, setHoursSpent] = useState(0);
  const [minutesSpent, setMinutesSpent] = useState(0);
  

  useEffect(() => {
    const fetchGame = async () => {
      const token = localStorage.getItem('shibaToken');
      if (!token) {
        router.push('/games');
        return;
      }

      try {
        const response = await fetch('/api/shiba/games', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const games = await response.json();
          const foundGame = games.find((g: Game) => g.id === resolvedParams.id);
          if (foundGame) {
            setGame(foundGame);
          } else {
            router.push('/games');
          }
        } else {
          router.push('/games');
        }
      } catch (error) {
        console.error('Failed to fetch game:', error);
        router.push('/games');
      } finally {
        setLoading(false);
      }
    };

    fetchGame();
  }, [resolvedParams.id, router]);

  const calculateTotalHours = (posts: GamePost[]): number => {
    return posts.reduce((total, post) => total + (post.HoursSpent || 0), 0);
  };

  const calculateSSSPerPlaytest = (game: Game): number => {
    const avgFun = typeof game.AverageFunScore === 'number' ? game.AverageFunScore : 0;
    const avgArt = typeof game.AverageArtScore === 'number' ? game.AverageArtScore : 0;
    const avgCreativity = typeof game.AverageCreativityScore === 'number' ? game.AverageCreativityScore : 0;
    const avgAudio = typeof game.AverageAudioScore === 'number' ? game.AverageAudioScore : 0;
    const avgMood = typeof game.AverageMoodScore === 'number' ? game.AverageMoodScore : 0;
    
    const totalScore = avgFun + avgArt + avgCreativity + avgAudio + avgMood;
    
    return totalScore
  };

  const getRadarData = (game: Game) => {
    return [
      { metric: 'Fun', score: typeof game.AverageFunScore === 'number' ? game.AverageFunScore : 0 },
      { metric: 'Art', score: typeof game.AverageArtScore === 'number' ? game.AverageArtScore : 0 },
      { metric: 'Creativity', score: typeof game.AverageCreativityScore === 'number' ? game.AverageCreativityScore : 0 },
      { metric: 'Audio', score: typeof game.AverageAudioScore === 'number' ? game.AverageAudioScore : 0 },
      { metric: 'Mood', score: typeof game.AverageMoodScore === 'number' ? game.AverageMoodScore : 0 },
    ];
  };

  const getBestWorstScores = (game: Game) => {
    const metrics = [
      { key: 'fun', label: 'Fun', value: typeof game.AverageFunScore === 'number' ? game.AverageFunScore : 0 },
      { key: 'art', label: 'Art', value: typeof game.AverageArtScore === 'number' ? game.AverageArtScore : 0 },
      { key: 'creativity', label: 'Creativity', value: typeof game.AverageCreativityScore === 'number' ? game.AverageCreativityScore : 0 },
      { key: 'audio', label: 'Audio', value: typeof game.AverageAudioScore === 'number' ? game.AverageAudioScore : 0 },
      { key: 'mood', label: 'Mood', value: typeof game.AverageMoodScore === 'number' ? game.AverageMoodScore : 0 },
    ];
    const best = metrics.reduce((a, b) => (b.value > a.value ? b : a), metrics[0]);
    const worst = metrics.reduce((a, b) => (b.value < a.value ? b : a), metrics[0]);
    return { best, worst };
  };

  const formatScore = (score: number | { specialValue: "NaN" }): string => {
    if (typeof score === 'object' && score.specialValue === "NaN") {
      return "N/A";
    }
    return typeof score === 'number' ? score.toFixed(1) : "N/A";
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

  const getLatestPlayLink = (posts: GamePost[]): string | null => {
    const playPosts = posts.filter(post => post.PlayLink).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return playPosts.length > 0 ? playPosts[0].PlayLink : null;
  };

  const getBadgeInitials = (badge: string): string => {
    return badge
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };



  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setPostFiles(selectedFiles);
  };

  const removeFile = (index: number) => {
    setPostFiles(prev => prev.filter((_, i) => i !== index));
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); 
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const validatePostForm = () => {
    if (!postContent.trim()) {
      setPostMessage('Please enter a description');
      return false;
    }

    if (postType === 'devlog' && postFiles.length === 0) {
      setPostMessage('Please add a screenshot or video for your devlog');
      return false;
    }

    if (postType === 'ship') {
      const zipFile = postFiles.find(f => f.name.toLowerCase().endsWith('.zip'));
      if (!zipFile) {
        setPostMessage('Please upload a .zip file for your demo');
        return false;
      }
    }

    if (postType === 'artlog') {
      if (!timelapseVideoId.trim()) {
        setPostMessage('Please provide a timelapse video ID');
        return false;
      }
      if (!githubImageLink.trim()) {
        setPostMessage('Please provide a GitHub image link');
        return false;
      }
      if (hoursSpent === 0 && minutesSpent === 0) {
        setPostMessage('Please specify time spent');
        return false;
      }
    }

    return true;
  };

  const handleCreatePost = async () => {
    if (!game || !validatePostForm()) return;

    setIsPosting(true);
    setPostMessage('');

    try {
      const token = localStorage.getItem('shibaToken');
      if (!token) {
        setPostMessage('No authentication token found');
        return;
      }

      
      const attachmentsUpload = await Promise.all(
        postFiles.map(async (file) => {
          const base64 = await fileToBase64(file);
          return {
            fileBase64: base64,
            contentType: file.type,
            filename: file.name,
            size: file.size
          };
        })
      );

      const postData: any = {
        token,
        gameId: game.id,
        content: postContent.trim(),
        attachmentsUpload,
        postType
      };

      
      if (postType === 'artlog') {
        postData.timelapseVideoId = timelapseVideoId;
        postData.githubImageLink = githubImageLink;
        postData.timeScreenshotId = timeScreenshotId;
        postData.hoursSpent = hoursSpent;
        postData.minutesSpent = minutesSpent;
      }

      const response = await fetch('/api/shiba/createPost', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });

      const result = await response.json();

      if (response.ok && result.ok) {
        setPostMessage('Post created successfully!');
        
        
        setPostContent('');
        setPostFiles([]);
        setTimelapseVideoId('');
        setGithubImageLink('');
        setTimeScreenshotId('');
        setHoursSpent(0);
        setMinutesSpent(0);

        
        const newPost: GamePost = {
          id: result.post?.id || Date.now().toString(),
          createdTime: result.post?.createdAt || new Date().toISOString(),
          createdAt: result.post?.createdAt || new Date().toISOString(),
          'Created At': result.post?.createdAt || new Date().toISOString(),
          PlayLink: result.post?.PlayLink || '',
          attachments: result.post?.attachments || [],
          'slack id': [],
          'Game Name': [game.name],
          content: result.post?.content || postContent,
          PostID: result.post?.PostID || Date.now().toString(),
          GameThumbnail: game.thumbnailUrl || '',
          badges: result.post?.badges || [],
          postType: postType,
          timelapseVideoId: result.post?.timelapseVideoId || '',
          githubImageLink: result.post?.githubImageLink || '',
          timeScreenshotId: result.post?.timeScreenshotId || '',
          HoursSpent: result.post?.hoursSpent || 0,
          hoursSpent: result.post?.hoursSpent || 0,
          minutesSpent: result.post?.minutesSpent || 0,
          posterShomatoSeeds: []
        };

        setGame(prev => prev ? {
          ...prev,
          posts: [newPost, ...prev.posts]
        } : null);

        setTimeout(() => setPostMessage(''), 3000);
      } else {
        setPostMessage(`Failed to create post: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Post creation error:', error);
      setPostMessage('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iIzk0YTNiOCIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>
        <Navigation />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
            <div className="h-64 bg-slate-200 rounded mb-6"></div>
            <div className="h-6 bg-slate-200 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!game) {
    return null;
  }

  const sortedPosts = game.posts.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZG90IiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjEuNSIgZmlsbD0iIzk0YTNiOCIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2RvdCkiLz48L3N2Zz4=')] opacity-40"></div>
      
      <Navigation />
      
      <div className="relative w-full px-4 sm:px-6 lg:px-12 xl:px-16 pt-8 pb-20">
        <Link 
          href="/games"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Games
        </Link>

        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-4 lg:p-6 mb-4 lg:mb-6 shadow-lg">
          <div className="flex items-center gap-4 lg:gap-6">
            <div className="relative w-16 h-16 lg:w-24 lg:h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg overflow-hidden flex-shrink-0">
              {game.thumbnailUrl ? (
                <img
                  src={game.thumbnailUrl}
                  alt={game.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Gamepad2 className="w-8 h-8 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2">{game.name}</h1>
              <p className="text-slate-600 text-sm line-clamp-2 mb-3 hidden sm:block">{game.description}</p>

              <div className="flex items-center gap-2 lg:gap-4 text-xs lg:text-sm text-slate-500 flex-wrap">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {calculateTotalHours(game.posts).toFixed(1)}h logged
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  {game.numberComplete} playtests
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  {game.posts.length} posts
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {getLatestPlayLink(game.posts) && (
                <a
                  href={getLatestPlayLink(game.posts)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm lg:text-base"
                >
                  <Play className="w-4 h-4" />
                  <span className="hidden sm:inline">Play</span>
                </a>
              )}
              {game.GitHubURL && (
                <a
                  href={game.GitHubURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-medium text-sm lg:text-base"
                >
                  <Github className="w-4 h-4" />
                  <span className="hidden sm:inline">Code</span>
                </a>
              )}
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-6">
          
          <div className="lg:col-span-3 space-y-4 lg:space-y-6 order-1">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg lg:text-xl font-bold text-slate-800">Recent Updates ({game.posts.length})</h2>
                <button
                  onClick={() => {
                    const createSection = document.getElementById('create-post-section');
                    createSection?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex items-center gap-1 lg:gap-2 px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">New Post</span>
                  <span className="sm:hidden">New</span>
                </button>
              </div>

              {sortedPosts.map((post) => (
                <div key={post.id} className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-4 lg:p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(post.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      {post.HoursSpent > 0 && (
                        <div className="flex items-center gap-1 text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">{post.HoursSpent.toFixed(1)}h</span>
                        </div>
                      )}
                    </div>

                    {post.badges.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {post.badges.map((badge, i) => (
                          <span
                            key={i}
                            className="w-7 h-7 bg-blue-100 text-blue-700 text-xs rounded-full font-bold flex items-center justify-center cursor-help hover:bg-blue-200 transition-colors"
                            title={badge}
                          >
                            {getBadgeInitials(badge)}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="prose prose-slate max-w-none mb-6">
                    <p className="text-slate-700 leading-relaxed">{post.content}</p>
                  </div>

                  {post.attachments && post.attachments.length > 0 && (
                    <div className="mb-4">
                      <div className="space-y-3">
                        {post.attachments.map((attachment, i) => (
                          <EmbeddedAttachment
                            key={i}
                            attachment={attachment}
                            index={i}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {post.PlayLink && (
                    <div className="mt-4">
                      <a
                        href={post.PlayLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-lg p-4 border border-green-200/50 transition-all duration-300 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Play className="w-4 h-4 text-green-600 ml-0.5" />
                            </div>
                          </div>
                          <div>
                            <h4 className="font-medium text-slate-800">Play This Version</h4>
                            <p className="text-xs text-slate-600">Opens in new tab</p>
                          </div>
                        </div>
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {sortedPosts.length === 0 && (
                <div className="text-center py-12 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40">
                  <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No Posts Yet</h3>
                  <p className="text-slate-500 text-sm">Start documenting your development journey!</p>
                </div>
              )}
            </div>
          </div>

          
          <div className="lg:col-span-2 space-y-4 lg:space-y-6 order-2">
            
            <div id="create-post-section" className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Create Post</h3>

              <div className="flex gap-1 mb-4">
                <button
                  onClick={() => setPostType('devlog')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    postType === 'devlog'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Devlog
                </button>
                <button
                  onClick={() => setPostType('ship')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    postType === 'ship'
                      ? 'bg-green-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Ship
                </button>
                <button
                  onClick={() => setPostType('artlog')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    postType === 'artlog'
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Art
                </button>
              </div>

              <div className="mb-4">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical text-sm"
                  rows={3}
                  placeholder="What did you work on today?"
                />
              </div>

              <div className="mb-4">
                <div className="border border-dashed border-slate-300 rounded-lg p-3">
                  <input
                    type="file"
                    multiple={postType !== 'ship'}
                    accept={
                      postType === 'devlog'
                        ? 'image/*,video/*'
                        : postType === 'ship'
                        ? '.zip'
                        : 'image/*,video/*'
                    }
                    onChange={handleFileSelect}
                    className="hidden"
                    id="post-file-input"
                  />
                  <button
                    onClick={() => document.getElementById('post-file-input')?.click()}
                    className="w-full flex items-center justify-center gap-2 py-2 text-slate-600 hover:text-slate-800 text-sm"
                  >
                    <Upload className="w-4 h-4" />
                    Add Files
                  </button>
                </div>
              </div>

              {postMessage && (
                <div className={`mb-4 p-2 rounded-lg text-xs ${
                  postMessage.includes('success')
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {postMessage}
                </div>
              )}

              <button
                onClick={handleCreatePost}
                disabled={isPosting}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm font-medium"
              >
                {isPosting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post Update
                  </>
                )}
              </button>
            </div>

            
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/50 p-4 lg:p-6 shadow-lg">
              <h2 className="text-lg lg:text-xl font-bold text-slate-800 mb-3 lg:mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 lg:w-5 h-4 lg:h-5" />
                <span className="hidden sm:inline">Game Statistics</span>
                <span className="sm:hidden">Stats</span>
              </h2>
              <div className="grid grid-cols-3 gap-2 lg:gap-4">
                <div className="text-center p-2 lg:p-4 bg-slate-50 rounded-xl">
                  <Clock className="w-6 lg:w-8 h-6 lg:h-8 text-blue-500 mx-auto mb-1 lg:mb-2" />
                  <div className="text-lg lg:text-2xl font-bold text-slate-800">{calculateTotalHours(game.posts).toFixed(1)}h</div>
                  <div className="text-xs lg:text-sm text-slate-500">Time logged</div>
                </div>
                <div className="text-center p-2 lg:p-4 bg-slate-50 rounded-xl">
                  <Users className="w-6 lg:w-8 h-6 lg:h-8 text-green-500 mx-auto mb-1 lg:mb-2" />
                  <div className="text-lg lg:text-2xl font-bold text-slate-800">{game.numberComplete}</div>
                  <div className="text-xs lg:text-sm text-slate-500">Playtests</div>
                </div>
                <div className="text-center p-2 lg:p-4 bg-slate-50 rounded-xl">
                  <Eye className="w-6 lg:w-8 h-6 lg:h-8 text-purple-500 mx-auto mb-1 lg:mb-2" />
                  <div className="text-lg lg:text-2xl font-bold text-slate-800">{formatTime(game.AveragePlaytestSeconds)}</div>
                  <div className="text-xs lg:text-sm text-slate-500">Avg Playtime</div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-slate-500" />
                  <div>
                    <div className="font-semibold text-slate-800">{game.posts.length} Devlogs</div>
                    <div className="text-xs text-slate-500">Posts created</div>
                  </div>
                </div>
                {(() => {
                  const { best, worst } = getBestWorstScores(game);
                  return (
                    <>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Star className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="font-semibold text-slate-800">{best.label}: {best.value.toFixed(1)}</div>
                          <div className="text-xs text-slate-500">Best Category</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <MessageSquare className="w-5 h-5 text-slate-500" />
                        <div>
                          <div className="font-semibold text-slate-800">{worst.label}: {worst.value.toFixed(1)}</div>
                          <div className="text-xs text-slate-500">Needs Improvement</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            
            {game.numberComplete > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-6 shadow-lg">
                <h3 className="text-sm font-bold text-slate-800 mb-4 text-center">Rating Breakdown</h3>
                <div className="flex justify-center">
                  <div className="w-40 h-40 flex-shrink-0">
                    <GlowingStrokeRadarChart
                      data={getRadarData(game)}
                      className="w-full h-full"
                      width={160}
                      height={160}
                      isMiniature={true}
                      borderColor="rgba(139, 92, 246, 1)"
                      pointBackgroundColor="rgba(139, 92, 246, 1)"
                      pointBorderColor="rgba(255, 255, 255, 1)"
                    />
                  </div>
                </div>
              </div>
            )}

            {game.Feedback && game.Feedback.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 p-4 shadow-lg">
                <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Player Feedback ({(Array.isArray(game.Feedback) ? game.Feedback : [game.Feedback]).length})
                </h3>
                <div className="space-y-3">
                  {(Array.isArray(game.Feedback) ? game.Feedback : [game.Feedback]).map((feedback, i) => (
                    <div key={i} className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-4 border border-slate-200/50">
                      <p className="text-slate-700 text-sm leading-relaxed">{feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
