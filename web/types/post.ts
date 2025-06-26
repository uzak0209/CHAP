export interface Post {
  id: string;
  userId: string;
  content: string;
  images?: string[];
  tags: string[];
  reactions: {
    likes: number;
    comments: number;
  };
  distance?: number;
  createdAt: string;
} 