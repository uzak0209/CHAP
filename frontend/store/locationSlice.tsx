import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LatLng ,Status,LocationState} from "@/types/types";


const initialState: LocationState = {
  state: Status.IDLE,
  location: { lat: 0, lng: 0 }, // デフォルト値として0,0を設定
  error: undefined,
};

// 位置情報をキャッシュなしで強制取得
export const refreshLocation = createAsyncThunk<
  LatLng,
  void,
  { rejectValue: string }
>("location/refresh", async (_, { rejectWithValue }) => {
  console.log("🔄 位置情報をリフレッシュ中...");
  console.log("  - キャッシュを無視して新しい位置情報を取得");
  
  return new Promise<LatLng>((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocationがサポートされていません");
      return rejectWithValue("Geolocation is not supported by this browser.");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        console.log("✅ 位置情報リフレッシュ成功:");
        console.log("  - 緯度:", coords.lat);
        console.log("  - 経度:", coords.lng);
        console.log("  - 精度:", position.coords.accuracy, "メートル");
        console.log("  - タイムスタンプ:", new Date(position.timestamp).toISOString());
        
        // 東京駅チェック
        const isTokyoStation = Math.abs(coords.lat - 35.6876288) < 0.001 && 
                             Math.abs(coords.lng - 139.7030912) < 0.001;
        if (isTokyoStation) {
          console.warn("⚠️ 東京駅の座標が検出されました - 位置情報がオーバーライドされている可能性があります");
        }
        
        resolve(coords);
      },
      (error) => {
        console.error("❌ 位置情報リフレッシュエラー:");
        console.error("  - エラーコード:", error.code);
        console.error("  - メッセージ:", error.message);
        return rejectWithValue(`位置情報リフレッシュ失敗: ${error.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0, // キャッシュを使用しない
      }
    );
  });
});

// Async Thunk
export const getCurrentLocation = createAsyncThunk<
  LatLng,
  void,
  { rejectValue: string }
>("location/getCurrent", async (_, { rejectWithValue }) => {
  console.log("📍 位置情報取得開始");
  console.log("  - ブラウザ:", navigator.userAgent.split(' ')[0]);
  console.log("  - タイムゾーン:", Intl.DateTimeFormat().resolvedOptions().timeZone);
  
  return new Promise<LatLng>((resolve, reject) => {
    if (!navigator.geolocation) {
      console.error("❌ Geolocationがサポートされていません");
      return rejectWithValue("Geolocation is not supported by this browser.");
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        console.log("✅ 位置情報取得成功:");
        console.log("  - 緯度:", coords.lat);
        console.log("  - 経度:", coords.lng);
        console.log("  - 精度:", position.coords.accuracy, "メートル");
        console.log("  - タイムスタンプ:", new Date(position.timestamp).toISOString());
        console.log("  - 高度:", position.coords.altitude || "不明");
        console.log("  - 速度:", position.coords.speed || "不明");
        console.log("  - 方向:", position.coords.heading || "不明");
        
        // 詳細なネットワーク情報
        console.log("🌐 ネットワーク情報:");
        console.log("  - 接続タイプ:", (navigator as any).connection?.effectiveType || "不明");
        console.log("  - ダウンリンク:", (navigator as any).connection?.downlink || "不明");
        console.log("  - RTT:", (navigator as any).connection?.rtt || "不明");
        
        // ブラウザ設定確認
        console.log("🔧 ブラウザ設定:");
        console.log("  - Cookie有効:", navigator.cookieEnabled);
        console.log("  - Do Not Track:", navigator.doNotTrack);
        console.log("  - オンライン:", navigator.onLine);
        console.log("  - 言語:", navigator.language);
        console.log("  - プラットフォーム:", navigator.platform);
        
        // 位置情報ソースの推定
        if (position.coords.accuracy <= 10) {
          console.log("🛰️ GPS使用の可能性が高い (高精度)");
        } else if (position.coords.accuracy <= 100) {
          console.log("📶 Wi-Fi/携帯基地局使用の可能性 (中精度)");
        } else {
          console.log("🌐 IP位置情報の可能性 (低精度)");
        }
        
        // 愛知県範囲チェック
        const isInAichi = coords.lat >= 34.5 && coords.lat <= 35.5 && 
                         coords.lng >= 136.5 && coords.lng <= 138.0;
        console.log("  - 愛知県内:", isInAichi ? "はい" : "いいえ");
        
        if (!isInAichi) {
          console.warn("⚠️ 取得された座標が愛知県外です");
          console.warn("   考えられる原因:");
          console.warn("   1. VPN/プロキシの使用");
          console.warn("   2. Wi-Fi位置情報データベースの不正確性");
          console.warn("   3. 携帯キャリアの基地局位置情報の誤差");
        }
        
        resolve(coords);
      },
      (error) => {
        console.error("❌ 位置情報取得エラー:");
        console.error("  - エラーコード:", error.code);
        console.error("  - メッセージ:", error.message);
        console.error("  - エラー種別:", 
          error.code === 1 ? "PERMISSION_DENIED (位置情報の許可が拒否されています)" :
          error.code === 2 ? "POSITION_UNAVAILABLE (位置情報が利用できません)" :
          error.code === 3 ? "TIMEOUT (位置情報取得がタイムアウトしました)" : "UNKNOWN");
        return rejectWithValue(error.message);
      },
      {
        enableHighAccuracy: true,  // GPS優先
        timeout: 10000,           // 10秒でタイムアウト
        maximumAge: 0,            // キャッシュを使用しない
      }
    );
  });
});

// location slice
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    builder
      .addCase(getCurrentLocation.pending, (state) => {
        state.state = Status.LOADING;
        // locationはそのまま保持（undefinedにしない）
        state.error = undefined;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.state = Status.LOADED;
        state.location = action.payload;
        state.error = undefined;
        console.log("位置情報を取得しました", state.location);
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.state = Status.ERROR;
        // locationはそのまま保持（undefinedにしない）
        state.error =
          action.payload ??
          action.error.message ??
          "位置情報の取得に失敗しました";
      })
      .addCase(refreshLocation.pending, (state) => {
        state.state = Status.LOADING;
        state.error = undefined;
      })
      .addCase(refreshLocation.fulfilled, (state, action) => {
        state.state = Status.LOADED;
        state.location = action.payload;
        state.error = undefined;
        console.log("位置情報をリフレッシュしました", state.location);
      })
      .addCase(refreshLocation.rejected, (state, action) => {
        state.state = Status.ERROR;
        state.error =
          action.payload ??
          action.error.message ??
          "位置情報のリフレッシュに失敗しました";
      });
  },
})

export const locationActions = locationSlice.actions;
export default locationSlice.reducer;
