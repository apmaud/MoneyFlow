import { combineReducers, configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

import authReducer from "./authSlice";
import accountsReducer from "./accountsSlice";
import transfersReducer from "./transfersSlice";

// Only auth is persisted
const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  accounts: accountsReducer,
  transfers: transfersReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispatches non-serializable action metadata;
        // this is the standard exemption list from their own docs.
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);
