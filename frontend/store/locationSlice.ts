import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { LatLng ,Status,LocationState} from "@/types/types";


const initialState: LocationState = {
  state: Status.IDLE,
  location: { lat: 0, lng: 0 }, // デフォルト値として0,0を設定
  error: undefined,
};

// Async Thunk
export const getCurrentLocation = createAsyncThunk<
  LatLng,
  void,
  { rejectValue: string }
>("location/getCurrent", async (_, { rejectWithValue }) => {
  
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
        resolve(coords);
      },
      (error) => {
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
      // .addCase(refreshLocation.pending, (state) => {
      //   state.state = Status.LOADING;
      //   state.error = undefined;
      // })
      // .addCase(refreshLocation.fulfilled, (state, action) => {
      //   state.state = Status.LOADED;
      //   state.location = action.payload;
      //   state.error = undefined;
      //   console.log("位置情報をリフレッシュしました", state.location);
      // })
      // .addCase(refreshLocation.rejected, (state, action) => {
      //   state.state = Status.ERROR;
      //   state.error =
      //     action.payload ??
      //     action.error.message ??
      //     "位置情報のリフレッシュに失敗しました";
      // });
  },
})

export const locationActions = locationSlice.actions;
export default locationSlice.reducer;
