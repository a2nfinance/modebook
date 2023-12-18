import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import accountReducer from "./account/accountSlice";
import activeOrderReducer from "./order/activeOrderSlice";
import bookReducer from "./book/bookSlice";
export function makeStore() {
    return configureStore({
        reducer: {
            account: accountReducer,
            activeOrder: activeOrderReducer,
            book: bookReducer
        },
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({
                serializableCheck: false,
            }),
    })
}

export const store = makeStore()

export type AppState = ReturnType<typeof store.getState>

export type AppDispatch = typeof store.dispatch

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    AppState,
    unknown,
    Action<string>
>