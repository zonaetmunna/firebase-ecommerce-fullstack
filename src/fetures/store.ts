import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import cartSlice from "./cart/cartSlice";
import userSlice from "./user/userSlice";
import wishlistSlice from "./wishlist/wishlistSlice";

export const store = configureStore({
  reducer: {
    cart: cartSlice,
    wishlist: wishlistSlice,
    auth: userSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
