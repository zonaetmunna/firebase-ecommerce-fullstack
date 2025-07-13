import firebaseApp from "@/firebase/firebase.config";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const db = getFirestore(firebaseApp);

interface OrderState {
  orders: IOrder[];
  userOrders: IOrder[];
  currentOrder: IOrder | null;
  recentOrders: IOrder[];
  filters: IOrderFilter;
  loading: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  userOrders: [],
  currentOrder: null,
  recentOrders: [],
  filters: {},
  loading: false,
  error: null,
};

// Get all orders (Admin)
export const getAllOrders = createAsyncThunk(
  "order/getAllOrders",
  async (filters: IOrderFilter = {}, { rejectWithValue }) => {
    try {
      let q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

      // Apply filters
      if (filters.status) {
        q = query(q, where("orderStatus", "==", filters.status));
      }
      if (filters.paymentStatus) {
        q = query(q, where("paymentStatus", "==", filters.paymentStatus));
      }
      if (filters.dateFrom && filters.dateTo) {
        const startDate = Timestamp.fromDate(new Date(filters.dateFrom));
        const endDate = Timestamp.fromDate(new Date(filters.dateTo));
        q = query(
          q,
          where("createdAt", ">=", startDate),
          where("createdAt", "<=", endDate)
        );
      }

      const snapshot = await getDocs(q);
      const orders: IOrder[] = [];

      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as IOrder);
      });

      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get user orders
export const getUserOrders = createAsyncThunk(
  "order/getUserOrders",
  async (userId: string, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "orders"),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      const orders: IOrder[] = [];

      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as IOrder);
      });

      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get single order
export const getOrder = createAsyncThunk(
  "order/getOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const snapshot = await getDoc(orderRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as IOrder;
      } else {
        return rejectWithValue("Order not found");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create order
export const createOrder = createAsyncThunk(
  "order/createOrder",
  async (
    orderData: Omit<IOrder, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        ...orderData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newOrder = { id: docRef.id, ...orderData } as IOrder;
      return newOrder;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update order
export const updateOrder = createAsyncThunk(
  "order/updateOrder",
  async (
    { id, data }: { id: string; data: Partial<IOrder> },
    { rejectWithValue }
  ) => {
    try {
      const orderRef = doc(db, "orders", id);
      await updateDoc(orderRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return { id, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update order status
export const updateOrderStatus = createAsyncThunk(
  "order/updateOrderStatus",
  async (
    { orderId, status }: { orderId: string; status: IOrder["orderStatus"] },
    { rejectWithValue }
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        orderStatus: status,
        updatedAt: serverTimestamp(),
      });

      return { orderId, status };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update payment status
export const updatePaymentStatus = createAsyncThunk(
  "order/updatePaymentStatus",
  async (
    {
      orderId,
      paymentStatus,
    }: { orderId: string; paymentStatus: IOrder["paymentStatus"] },
    { rejectWithValue }
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        paymentStatus,
        updatedAt: serverTimestamp(),
      });

      return { orderId, paymentStatus };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete order
export const deleteOrder = createAsyncThunk(
  "order/deleteOrder",
  async (orderId: string, { rejectWithValue }) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);

      return orderId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get recent orders
export const getRecentOrders = createAsyncThunk(
  "order/getRecentOrders",
  async (limitCount: number = 10, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "orders"),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const orders: IOrder[] = [];

      snapshot.forEach((doc) => {
        orders.push({ id: doc.id, ...doc.data() } as IOrder);
      });

      return orders;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get order statistics
export const getOrderStats = createAsyncThunk(
  "order/getOrderStats",
  async (_, { rejectWithValue }) => {
    try {
      const ordersQuery = query(collection(db, "orders"));
      const snapshot = await getDocs(ordersQuery);

      let totalOrders = 0;
      let totalRevenue = 0;
      let pendingOrders = 0;
      let completedOrders = 0;

      snapshot.forEach((doc) => {
        const order = doc.data() as IOrder;
        totalOrders++;
        totalRevenue += order.totalAmount;

        if (order.orderStatus === "pending") pendingOrders++;
        if (order.orderStatus === "delivered") completedOrders++;
      });

      return {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Bulk update orders
export const bulkUpdateOrders = createAsyncThunk(
  "order/bulkUpdateOrders",
  async (
    updates: { id: string; data: Partial<IOrder> }[],
    { rejectWithValue }
  ) => {
    try {
      const updatePromises = updates.map(({ id, data }) => {
        const orderRef = doc(db, "orders", id);
        return updateDoc(orderRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
      });

      await Promise.all(updatePromises);
      return updates;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Order slice
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<IOrderFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    setCurrentOrder: (state, action: PayloadAction<IOrder | null>) => {
      state.currentOrder = action.payload;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all orders
      .addCase(getAllOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.orders = action.payload;
        state.loading = false;
      })
      .addCase(getAllOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get user orders
      .addCase(getUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.userOrders = action.payload;
        state.loading = false;
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get single order
      .addCase(getOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrder.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
        state.loading = false;
      })
      .addCase(getOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.orders.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update order
      .addCase(updateOrder.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.orders.findIndex((o) => o.id === id);
        if (index !== -1) {
          state.orders[index] = { ...state.orders[index], ...data };
        }
        if (state.currentOrder?.id === id) {
          state.currentOrder = { ...state.currentOrder, ...data };
        }
      })
      // Update order status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        const order = state.orders.find((o) => o.id === orderId);
        if (order) {
          order.orderStatus = status;
        }
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.orderStatus = status;
        }
      })
      // Update payment status
      .addCase(updatePaymentStatus.fulfilled, (state, action) => {
        const { orderId, paymentStatus } = action.payload;
        const order = state.orders.find((o) => o.id === orderId);
        if (order) {
          order.paymentStatus = paymentStatus;
        }
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.paymentStatus = paymentStatus;
        }
      })
      // Delete order
      .addCase(deleteOrder.fulfilled, (state, action) => {
        const orderId = action.payload;
        state.orders = state.orders.filter((o) => o.id !== orderId);
        if (state.currentOrder?.id === orderId) {
          state.currentOrder = null;
        }
      })
      // Get recent orders
      .addCase(getRecentOrders.fulfilled, (state, action) => {
        state.recentOrders = action.payload;
      })
      // Bulk update orders
      .addCase(bulkUpdateOrders.fulfilled, (state, action) => {
        action.payload.forEach(({ id, data }) => {
          const index = state.orders.findIndex((o) => o.id === id);
          if (index !== -1) {
            state.orders[index] = { ...state.orders[index], ...data };
          }
        });
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setFilters,
  clearFilters,
  setCurrentOrder,
  clearCurrentOrder,
} = orderSlice.actions;

export default orderSlice.reducer;
