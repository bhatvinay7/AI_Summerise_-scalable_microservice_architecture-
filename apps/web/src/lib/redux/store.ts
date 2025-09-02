import { configureStore,EnhancedStore } from '@reduxjs/toolkit'
import sideBarReducer from "./featuresSlice/slideBarSlice"
import userReducer from './featuresSlice/userDetails'
export const makeStore:()=>EnhancedStore= () => {
  return configureStore({
    reducer: {
        sideBar:sideBarReducer,
        user:userReducer,
    }
  })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']

