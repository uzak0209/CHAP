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
    id: number;
    type: ObjectType;
    user?: User;
    createdTime: Date;
    valid: boolean;
}
//MapObjectのタイプを定義
export enum ObjectType{
    MESSAGE = "MESSAGE",
    THREAD = "THREAD",
    EVENT = "EVENT",
}