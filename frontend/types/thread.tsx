export type PostCategory = 'entertainment' | 'community' | 'disaster';

export interface Reply {
  id: number;
  message: string;
  author: string;
  timestamp: string;
}

export interface Thread {
  id: number;
  coordinates: [number, number];
  message: string;
  author: string;
  timestamp: string;
  replyCount: number;
  category: PostCategory;
  like: number;
  replies: Reply[];
}

export interface ThreadGroup {
  mainThread: Thread;
  overlappingCount: number;
  allThreads: Thread[];
}
