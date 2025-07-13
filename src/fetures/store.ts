import {
  Action,
  ThunkAction,
  combineReducers,
  configureStore,
} from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import adminSlice from "./admin/adminSlice";
import cartSlice from "./cart/cartSlice";
import categorySlice from "./category/categorySlice";
import orderSlice from "./order/orderSlice";
import productSlice from "./product/productSlice";
import userSlice from "./user/userSlice";
import wishlistSlice from "./wishlist/wishlistSlice";

// Redux Persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["cart", "wishlist", "auth"], // Only persist these slices
};

// Admin persist configuration (separate for admin data)
const adminPersistConfig = {
  key: "admin",
  storage,
  whitelist: ["users", "analytics", "settings"], // Only persist users, analytics, and settings
};

// Product persist configuration
const productPersistConfig = {
  key: "product",
  storage,
  whitelist: ["featuredProducts", "topProducts", "filters"], // Cache featured products and filters
};

// Category persist configuration
const categoryPersistConfig = {
  key: "category",
  storage,
  whitelist: ["categories"], // Cache categories
};

// Order persist configuration
const orderPersistConfig = {
  key: "order",
  storage,
  whitelist: ["userOrders"], // Cache user orders
};

// Combine reducers
const rootReducer = combineReducers({
  cart: cartSlice,
  wishlist: wishlistSlice,
  auth: userSlice,
  admin: persistReducer(adminPersistConfig, adminSlice),
  product: persistReducer(productPersistConfig, productSlice),
  category: persistReducer(categoryPersistConfig, categorySlice),
  order: persistReducer(orderPersistConfig, orderSlice),
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/PERSIST",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
