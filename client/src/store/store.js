import { configureStore, combineReducers, getDefaultMiddleware } from "@reduxjs/toolkit";
import userReducer from './slices/userSlice';
import storage from 'redux-persist/lib/storage';
import { persistReducer, persistStore } from 'redux-persist';

const persistConfig = {
    key: 'root',
    storage
};

const persistedReducer = persistReducer(persistConfig, combineReducers({ user: userReducer }));

export const store = configureStore({
    reducer: persistedReducer,
    middleware: getDefaultMiddleware =>
        getDefaultMiddleware({
            serializableCheck: false,
            immutableCheck: { warnAfter: 128 }
        }),
});

export const persistor = persistStore(store);

