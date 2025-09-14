export interface FunnelData {
  signedUp: number;
  onboarded: number;
  slack: number;
  connectedHackatime: number;
  logged10Hours: number;
  logged20Hours: number;
  logged30Hours: number;
  logged40Hours: number;
  logged50Hours: number;
  logged60Hours: number;
  logged70Hours: number;
  logged80Hours: number;
  logged90Hours: number;
  logged100Hours: number;
}

export interface HoursPerDay {
  date: string;
  hours: number;
}

export interface ReviewBacklogItem {
  label: string;
  value: number;
  color: string;
}

export interface ReviewBacklog {
  success: boolean;
  data: ReviewBacklogItem[];
  total: number;
}

export interface SignupData {
  totalSignups: number;
  hackClubCommunity: number;
  referrals: number;
}

export interface DailyActiveUsers {
  date: string;
  userCount: number;
}

export interface ShibaAnalytics {
  funnelData: FunnelData;
  hoursPerDay: HoursPerDay[];
  reviewBacklog: ReviewBacklog;
  signupData: SignupData;
  dailyActiveUsers: DailyActiveUsers[];
}

export interface GamePost {
  id: string;
  createdTime: string;
  createdAt: string;
  "Created At": string;
  PlayLink: string;
  attachments: Array<{
    url: string;
    type: string;
    filename: string;
    id: string;
    size: number;
  }>;
  "slack id": string[];
  "Game Name": string[];
  content: string;
  PostID: string;
  GameThumbnail: string;
  badges: string[];
  postType: string;
  timelapseVideoId: string;
  githubImageLink: string;
  timeScreenshotId: string;
  HoursSpent: number;
  hoursSpent: number;
  minutesSpent: number;
  posterShomatoSeeds: number[];
}

export interface Game {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  GitHubURL: string;
  ShowreelLink: string;
  HackatimeProjects: string;
  HoursSpent: number;
  AveragePlaytestSeconds: number | { specialValue: "NaN" };
  AverageFunScore: number | { specialValue: "NaN" };
  AverageArtScore: number | { specialValue: "NaN" };
  AverageCreativityScore: number | { specialValue: "NaN" };
  AverageAudioScore: number | { specialValue: "NaN" };
  AverageMoodScore: number | { specialValue: "NaN" };
  numberComplete: number;
  Feedback: string | string[];
  posts: GamePost[];
}

export interface CachetUser {
  id: string;
  expiration: string;
  user: string;
  displayName: string;
  pronouns: string;
  image: string;
}

export interface ShibaProfile {
  ok: boolean;
  profile: {
    email: string;
    githubUsername: string;
    firstName: string;
    lastName: string;
    birthday: string;
    phoneNumber: string;
    slackId: string;
    referralCode: string;
    referralNumber: number;
    hasOnboarded: boolean;
    sssBalance: number;
    shomatoBalance: number;
    shomatoSeeds: number;
    address: {
      street1: string;
      street2: string;
      city: string;
      state: string;
      zipcode: string;
      country: string;
    };
  };
}

export interface Playtest {
  id: string;
  playtestId: string;
  gameToTest: string;
  status: string;
  createdAt: string;
  instructions: string;
  gameName: string;
  gameLink: string[];
  gameThumbnail: string;
  ownerSlackId: string;
  HoursSpent: number[];
  funScore: number;
  artScore: number;
  creativityScore: number;
  audioScore: number;
  moodScore: number;
  feedback: string;
  playtimeSeconds: number;
}

export interface PlaytestsResponse {
  ok: boolean;
  playtests: Playtest[];
}