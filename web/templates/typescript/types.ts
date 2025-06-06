import { DateTime } from 'luxon';
export type User = {
    id?: number;
    name?: string;
    email?: string;
    password?: string;
}
export type MapObject = {
  lat: number;
  lng: number;
  type: ObjectType;
  content: string|File;
  user_id?: number; // optional
  created_time: string; // ISO 8601 形式の日時文字列
  valid: boolean;
};
//MapObjectのタイプを定義
export enum ObjectType{
    MESSAGE = "MESSAGE",
    THREAD = "THREAD",
    EVENT = "EVENT",
}