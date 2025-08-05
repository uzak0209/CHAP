"use client";

import { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/AppLayout";
import { LoadingSpinner } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, MapPin, Users, Tag } from "lucide-react";

import { fetchAroundEvents, eventsActions } from "@/store/eventsSlice";
import { getCurrentLocation } from "@/store/locationSlice";
import { store, useAppDispatch, useAppSelector } from "@/store";
import { Event, Status } from "@/types/types";
import { useRouter } from "next/navigation";
import { verifyToken } from "@/store/authSlice";


// イベントカードコンポーネント
const EventCard = ({ event }: { event: Event }) => (
  <Card className="w-full transition-all hover:shadow-lg hover:-translate-y-1">
    <CardHeader>
      <CardTitle className="text-xl font-bold">{event.content}</CardTitle>
      <CardDescription className="flex items-center text-sm text-gray-500 pt-2">
        <Users className="w-4 h-4 mr-2" />
        <span>主催者: {event.user_id.substring(0, 8)}...</span>
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-4">
      <div className="flex items-center">
        <Calendar className="w-5 h-5 mr-3 text-gray-600" />
        <div>
          <p className="font-semibold">開催日時</p>
          <p>{new Date(event.created_at).toLocaleString()}</p>
        </div>
      </div>
      {/* <div className="flex items-center">
        <MapPin className="w-5 h-5 mr-3 text-gray-600" />
        <div>
          <p className="font-semibold">場所</p>
          <p>
            緯度: {event.coordinate.lat.toFixed(4)}, 経度:{" "}
            {event.coordinate.lng.toFixed(4)}
          </p>
        </div>
      </div> */}
      {event.tags && event.tags.length > 0 && (
        <div className="flex items-center">
          <Tag className="w-5 h-5 mr-3 text-gray-600" />
          <div className="flex flex-wrap gap-2">
            {event.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-gray-200 text-gray-800 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
      <Button className="w-full mt-2">詳細を見る</Button>
    </CardContent>
  </Card>
);

export default function EventsPage() {
  const [sortBy, setSortBy] = useState<"time" | "distance">("time");

  const dispatch = useAppDispatch();
  const {
    items: events,
    loading,
    error,
  } = useAppSelector((state) => state.events);
  const {
    state: locState,
    location,
    error: locError,
  } = useAppSelector((state) => state.location);
  const router = useRouter();
  // 位置情報取得とイベントデータ取得
  useEffect(() => {
    dispatch(getCurrentLocation());
    dispatch(verifyToken());
  }, []);

  useEffect(() => {
    locState === Status.LOADING || locState === Status.IDLE ? (
      null
    ) : dispatch(fetchAroundEvents({ lat: location.lat, lng: location.lng }));
  }, [location]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      if (sortBy === "time") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }
      // TODO: 距離でのソート
      return 0;
    });
  }, [events, sortBy]);

  const renderContent = () => {
    if (locState === Status.LOADING || locState === Status.IDLE) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-600">
            位置情報を取得しています...
          </p>
        </div>
      );
    }

    if (locState === Status.ERROR ) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">
            位置情報の取得に失敗しました: {locError}
          </p>
          <Button onClick={() => dispatch(getCurrentLocation())}>再試行</Button>
        </div>
      );
    }

    if (loading.fetch) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <LoadingSpinner />
          <p className="mt-4 text-lg text-gray-600">
            近くのイベントを探しています...
          </p>
        </div>
      );
    }

    if (error.fetch) {
      return (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">
            イベントの読み込みに失敗しました: {error.fetch}
          </p>
          <Button
            onClick={() => {
              dispatch(eventsActions.clearEventErrors());
              locState === Status.LOADED ? (
                null
              ) : dispatch(fetchAroundEvents({ lat: location.lat, lng: location.lng }));
            }}
          >
            再試行
          </Button>
        </div>
      );
    }

    if (sortedEvents.length === 0) {
      return (
        <div className="text-center py-10">
          <p className="text-gray-500">
            近くで開催されているイベントはありません。
          </p>
        </div>
      );
    }
    console.log("Sorted Events:", sortedEvents);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    );
  };

  return (
    <AppLayout title="イベントを探す">
      <div className="container mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">近くのイベント</h1>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/events/create")}
            >
              イベントを作成
            </Button>
            <Select
              onValueChange={(value: "time" | "distance") => setSortBy(value)}
              defaultValue={sortBy}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">新着順</SelectItem>
                <SelectItem value="distance">距離順</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        <main>{renderContent()}</main>
      </div>
    </AppLayout>
  );
}
