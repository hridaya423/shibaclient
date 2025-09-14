/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useRef } from 'react';
import { Upload, Image, FileText, Clock, Github, Play } from 'lucide-react';

interface PostCreatorProps {
  gameId: string;
  token: string;
  onPostCreated?: (post: any) => void;
}

type PostType = 'devlog' | 'ship' | 'artlog';

interface FileUpload {
  file: File;
  preview?: string;
  type: 'image' | 'video' | 'zip' | 'other';
}

export function PostCreator({ gameId, token, onPostCreated }: PostCreatorProps) {
  const [postType, setPostType] = useState<PostType>('devlog');
  const [content, setContent] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState('');

  
  const [timelapseVideoId, setTimelapseVideoId] = useState('');
  const [githubImageLink, setGithubImageLink] = useState('');
  const [timeScreenshotId, setTimeScreenshotId] = useState('');
  const [hoursSpent, setHoursSpent] = useState(0);
  const [minutesSpent, setMinutesSpent] = useState(0);

  
  const [demoText, setDemoText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    const newFiles = selectedFiles.map(file => {
      const fileType = getFileType(file);
      const upload: FileUpload = {
        file,
        type: fileType
      };

      
      if (fileType === 'image' || fileType === 'video') {
        upload.preview = URL.createObjectURL(file);
      }

      return upload;
    });

    setFiles(prev => [...prev, ...newFiles]);
  };

  const getFileType = (file: File): 'image' | 'video' | 'zip' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.name.toLowerCase().endsWith('.zip')) return 'zip';
    return 'other';
  };

  const removeFile = (index: number) => {
    setFiles(prev => {
      const newFiles = [...prev];
      const removed = newFiles.splice(index, 1)[0];
      if (removed.preview) {
        URL.revokeObjectURL(removed.preview);
      }
      return newFiles;
    });
  };

  const getAcceptedFileTypes = () => {
    switch (postType) {
      case 'devlog':
        return 'image/*,video/*,.mp4,.mov,.gif,.png,.jpg,.jpeg';
      case 'ship':
        return '.zip';
      case 'artlog':
        return 'image/*,video/*';
      default:
        return '*';
    }
  };

  const validateForm = () => {
    if (!content.trim()) {
      setMessage('Please enter a description');
      return false;
    }

    if (postType === 'devlog' && files.length === 0) {
      setMessage('Please add a screenshot or video for your devlog');
      return false;
    }

    if (postType === 'ship') {
      const zipFile = files.find(f => f.type === 'zip');
      if (!zipFile) {
        setMessage('Please upload a .zip file for your demo');
        return false;
      }
      if (!demoText.trim()) {
        setMessage('Please describe your demo');
        return false;
      }
    }

    if (postType === 'artlog') {
      if (!timelapseVideoId.trim()) {
        setMessage('Please provide a timelapse video ID');
        return false;
      }
      if (!githubImageLink.trim()) {
        setMessage('Please provide a GitHub image link');
        return false;
      }
      if (hoursSpent === 0 && minutesSpent === 0) {
        setMessage('Please specify time spent');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsPosting(true);
    setMessage('');

    try {
      
      const attachmentsUpload = await Promise.all(
        files.map(async (fileUpload) => {
          const base64 = await fileToBase64(fileUpload.file);
          return {
            fileBase64: base64,
            contentType: fileUpload.file.type,
            filename: fileUpload.file.name,
            size: fileUpload.file.size
          };
        })
      );

      const postData: any = {
        token,
        gameId,
        content: postType === 'ship' ? demoText : content,
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
        setMessage('Post created successfully!');
        
        
        setContent('');
        setDemoText('');
        setTimelapseVideoId('');
        setGithubImageLink('');
        setTimeScreenshotId('');
        setHoursSpent(0);
        setMinutesSpent(0);
        setFiles([]);
        
        
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        
        onPostCreated?.(result.post);

        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`Failed to create post: ${result.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Post creation error:', error);
      setMessage('Failed to create post. Please try again.');
    } finally {
      setIsPosting(false);
    }
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

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-white/50 p-6 shadow-lg">
      <h3 className="text-xl font-bold text-slate-800 mb-4">Create Post</h3>
      
      
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setPostType('devlog')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            postType === 'devlog' 
              ? 'bg-blue-600 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <FileText className="w-4 h-4 inline mr-1" />
          Devlog
        </button>
        <button
          onClick={() => setPostType('ship')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            postType === 'ship' 
              ? 'bg-green-600 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Play className="w-4 h-4 inline mr-1" />
          Ship Demo
        </button>
        <button
          onClick={() => setPostType('artlog')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            postType === 'artlog' 
              ? 'bg-purple-600 text-white' 
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Image className="w-4 h-4 inline mr-1" />
          Artlog
        </button>
      </div>

      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {postType === 'ship' ? 'Demo Description' : 'Description'}
        </label>
        <textarea
          value={postType === 'ship' ? demoText : content}
          onChange={(e) => postType === 'ship' ? setDemoText(e.target.value) : setContent(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
          rows={4}
          placeholder={
            postType === 'devlog' 
              ? "Describe what you've been working on..."
              : postType === 'ship'
              ? "Describe your demo and what's new..."
              : "Describe the art you've created..."
          }
        />
      </div>

      
      {postType === 'artlog' && (
        <div className="space-y-4 mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Timelapse Video ID
            </label>
            <input
              type="text"
              value={timelapseVideoId}
              onChange={(e) => setTimelapseVideoId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Video ID for your timelapse"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <Github className="w-4 h-4 inline mr-1" />
              GitHub Image Link
            </label>
            <input
              type="url"
              value={githubImageLink}
              onChange={(e) => setGithubImageLink(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://github.com/user/repo/asset.png"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Time Screenshot (optional)
            </label>
            <input
              type="text"
              value={timeScreenshotId}
              onChange={(e) => setTimeScreenshotId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Screenshot showing time spent"
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Hours
              </label>
              <input
                type="number"
                min="0"
                value={hoursSpent}
                onChange={(e) => setHoursSpent(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutesSpent}
                onChange={(e) => setMinutesSpent(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {postType === 'devlog' && 'Screenshots/Videos'}
          {postType === 'ship' && 'Demo ZIP File'}
          {postType === 'artlog' && 'Art Files'}
        </label>
        
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple={postType !== 'ship'}
            accept={getAcceptedFileTypes()}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-3 text-slate-600 hover:text-slate-800"
          >
            <Upload className="w-5 h-5" />
            {postType === 'ship' 
              ? 'Upload ZIP file' 
              : 'Upload files or drag & drop'}
          </button>
        </div>

        
        {files.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((fileUpload, index) => (
              <div key={index} className="relative">
                {fileUpload.preview ? (
                  fileUpload.type === 'image' ? (
                    <img
                      src={fileUpload.preview}
                      alt={fileUpload.file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <video
                      src={fileUpload.preview}
                      className="w-full h-24 object-cover rounded-lg"
                      muted
                    />
                  )
                ) : (
                  <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-6 h-6 mx-auto mb-1 text-slate-400" />
                      <p className="text-xs text-slate-600 truncate px-2">
                        {fileUpload.file.name}
                      </p>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      
      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          message.includes('success') 
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message}
        </div>
      )}

      
      <button
        onClick={handleSubmit}
        disabled={isPosting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isPosting ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {postType === 'ship' ? 'Shipping...' : 'Posting...'}
          </>
        ) : (
          <>
            {postType === 'devlog' && 'Post Devlog'}
            {postType === 'ship' && 'Ship Demo'}  
            {postType === 'artlog' && 'Post Artlog'}
          </>
        )}
      </button>
    </div>
  );
}