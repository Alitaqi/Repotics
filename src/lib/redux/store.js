// store/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import reportReducer from "./slices/reportSlice";
import { authApi } from "./api/authApi";
import { reportApi } from "./api/reportApi";
import { profileApi } from "./api/profileApi";
import { feedApi } from "./api/feedApi";
import profileReducer from "./slices/profileSlice";
import postReducer from "./slices/postSlice";
import { heatmapApi } from "./api/heatmapApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    report: reportReducer,
    posts: postReducer,
    profile: profileReducer,
    [heatmapApi.reducerPath]: heatmapApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [reportApi.reducerPath]: reportApi.reducer, 
    [profileApi.reducerPath]: profileApi.reducer,
    [feedApi.reducerPath]: feedApi.reducer, 
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authApi.middleware)
      .concat(reportApi.middleware)
      .concat(profileApi.middleware)
      .concat(feedApi.middleware)
      .concat(heatmapApi.middleware),
});
