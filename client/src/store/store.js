import { configureStore } from "@reduxjs/toolkit";
import { authSlice } from "./auth/authSlice";
import { quizSlice } from "./quiz/quizSlice";
import { announcementSlice } from "./announcement/announcementSlice";

export const store = configureStore({
  reducer: {
    [authSlice.reducerPath]: authSlice.reducer,
    [quizSlice.reducerPath]: quizSlice.reducer,
    [announcementSlice.reducerPath]: announcementSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(authSlice.middleware)
      .concat(quizSlice.middleware)
      .concat(announcementSlice.middleware),
});
