import { configureStore } from "@reduxjs/toolkit";
import pharmaciesReducer from "./slices/pharmaciesSlice";
import usersReducer from "./slices/usersSlice";
import notificationsReducer from "./slices/notificationsSlice";
import medicinesReducer from "./slices/medicinesSlice";

export const store = configureStore({
  reducer: {
    pharmacies: pharmaciesReducer,
    users: usersReducer,
    notifications: notificationsReducer,
    medicines: medicinesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
