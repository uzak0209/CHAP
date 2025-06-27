export type Coordinate = {
  lat: number;
  lng: number;
}

export type Post = {
  coordinate: Coordinate;
  id: number;
  user_id: number;
  created_time: string;
  deleted_time: string;
  content: string;
  valid: boolean;
  parent: number;
  like: number;
  tags: string[];
}

export type Thread = {
  coordinate: Coordinate;
  id: number;
  user_id: number;
  created_time: string;
  deleted_time: string;
  content: string;
  valid: boolean;
  like: number;
  tags: string[];
}

export type Event = {
  coordinate: Coordinate;
  id: number;
  user_id: number;
  created_time: string;
  deleted_time: string;
  content: string;
  valid: boolean;
  like: number;
  tags: string[];
}

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
  image: string;
  likes: number;
}
