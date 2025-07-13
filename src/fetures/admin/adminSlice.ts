import firebaseApp from "@/firebase/firebase.config";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const db = getFirestore(firebaseApp);

// Initial state
const initialState: {
  users: IUserManagement[];
  analytics: IAnalytics;
  dashboardStats: IDashboardStats | null;
  userStats: any;
  lowStockProducts: IInventoryItem[];
  notifications: INotification[];
  settings: ISettings | null;
  auditLogs: IAuditLog[];
  searchResults: ISearchResult | null;
  backups: IBackup[];
  exportData: any[];
  lastAuditDoc: any;
  isExporting: boolean;
  loading: boolean;
  error: string | null;
} = {
  users: [],
  analytics: {
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: [],
    monthlySales: [],
  },
  dashboardStats: null,
  userStats: null,
  lowStockProducts: [],
  notifications: [],
  settings: null,
  auditLogs: [],
  searchResults: null,
  backups: [],
  exportData: [],
  lastAuditDoc: null,
  isExporting: false,
  loading: false,
  error: null,
};

// Get dashboard analytics
export const getDashboardAnalytics = createAsyncThunk(
  "admin/getDashboardAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const [
        usersSnapshot,
        productsSnapshot,
        ordersSnapshot,
        recentOrdersSnapshot,
        topProductsSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "products")),
        getDocs(collection(db, "orders")),
        getDocs(
          query(
            collection(db, "orders"),
            orderBy("createdAt", "desc"),
            limit(10)
          )
        ),
        getDocs(
          query(
            collection(db, "products"),
            orderBy("rating", "desc"),
            limit(10)
          )
        ),
      ]);

      // Calculate total revenue
      let totalRevenue = 0;
      const orders: IOrder[] = [];
      ordersSnapshot.forEach((docSnap) => {
        const orderData = docSnap.data() as IOrder;
        totalRevenue += orderData.totalAmount;
        orders.push({ ...orderData, id: docSnap.id });
      });

      // Get recent orders
      const recentOrders: IOrder[] = [];
      recentOrdersSnapshot.forEach((docSnap) => {
        const orderData = docSnap.data() as IOrder;
        recentOrders.push({ ...orderData, id: docSnap.id });
      });

      // Get top products
      const topProducts: IProduct[] = [];
      topProductsSnapshot.forEach((docSnap) => {
        const productData = docSnap.data() as IProduct;
        topProducts.push({ ...productData, id: docSnap.id });
      });

      // Calculate monthly sales
      const monthlySales = calculateMonthlyStats(orders);

      return {
        totalUsers: usersSnapshot.size,
        totalProducts: productsSnapshot.size,
        totalOrders: ordersSnapshot.size,
        totalRevenue,
        recentOrders,
        topProducts,
        monthlySales,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get dashboard statistics
export const getDashboardStats = createAsyncThunk(
  "admin/getDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const currentDate = new Date();
      const lastMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        1
      );
      const thisMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const [
        currentUsersSnapshot,
        lastMonthUsersSnapshot,
        currentProductsSnapshot,
        lastMonthProductsSnapshot,
        currentOrdersSnapshot,
        lastMonthOrdersSnapshot,
      ] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(
          query(
            collection(db, "users"),
            where("createdAt", ">=", Timestamp.fromDate(lastMonth)),
            where("createdAt", "<", Timestamp.fromDate(thisMonth))
          )
        ),
        getDocs(collection(db, "products")),
        getDocs(
          query(
            collection(db, "products"),
            where("createdAt", ">=", Timestamp.fromDate(lastMonth)),
            where("createdAt", "<", Timestamp.fromDate(thisMonth))
          )
        ),
        getDocs(collection(db, "orders")),
        getDocs(
          query(
            collection(db, "orders"),
            where("createdAt", ">=", Timestamp.fromDate(lastMonth)),
            where("createdAt", "<", Timestamp.fromDate(thisMonth))
          )
        ),
      ]);

      // Calculate revenue
      let currentRevenue = 0;
      let lastMonthRevenue = 0;

      currentOrdersSnapshot.forEach((docSnap) => {
        const order = docSnap.data() as IOrder;
        if (order.createdAt && new Date(order.createdAt)) {
          const orderDate = new Date(order.createdAt);
          if (orderDate >= thisMonth) {
            currentRevenue += order.totalAmount;
          }
        }
      });

      lastMonthOrdersSnapshot.forEach((docSnap) => {
        const order = docSnap.data() as IOrder;
        lastMonthRevenue += order.totalAmount;
      });

      // Calculate growth percentages
      const revenueGrowth =
        lastMonthRevenue > 0
          ? ((currentRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
          : 0;

      const ordersGrowth =
        lastMonthOrdersSnapshot.size > 0
          ? ((currentOrdersSnapshot.size - lastMonthOrdersSnapshot.size) /
              lastMonthOrdersSnapshot.size) *
            100
          : 0;

      const productsGrowth =
        lastMonthProductsSnapshot.size > 0
          ? ((currentProductsSnapshot.size - lastMonthProductsSnapshot.size) /
              lastMonthProductsSnapshot.size) *
            100
          : 0;

      const usersGrowth =
        lastMonthUsersSnapshot.size > 0
          ? ((currentUsersSnapshot.size - lastMonthUsersSnapshot.size) /
              lastMonthUsersSnapshot.size) *
            100
          : 0;

      return {
        totalRevenue: currentRevenue,
        totalOrders: currentOrdersSnapshot.size,
        totalProducts: currentProductsSnapshot.size,
        totalUsers: currentUsersSnapshot.size,
        revenueGrowth,
        ordersGrowth,
        productsGrowth,
        usersGrowth,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get low stock products
export const getLowStockProducts = createAsyncThunk(
  "admin/getLowStockProducts",
  async (_, { rejectWithValue }) => {
    try {
      const productsQuery = query(
        collection(db, "products"),
        where("stock", "<=", 10),
        orderBy("stock", "asc")
      );

      const snapshot = await getDocs(productsQuery);
      const lowStockProducts: IInventoryItem[] = [];

      snapshot.forEach((docSnap) => {
        const product = docSnap.data() as IProduct;
        lowStockProducts.push({
          productId: docSnap.id,
          productName: product.name,
          currentStock: product.stock,
          reorderLevel: 10,
          status: product.stock === 0 ? "out_of_stock" : "low_stock",
          lastRestocked: product.updatedAt || product.createdAt || null,
        });
      });

      return lowStockProducts;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get recent activities
export const getRecentActivities = createAsyncThunk(
  "admin/getRecentActivities",
  async (_, { rejectWithValue }) => {
    try {
      const activitiesQuery = query(
        collection(db, "notifications"),
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const snapshot = await getDocs(activitiesQuery);
      const activities: INotification[] = [];

      snapshot.forEach((docSnap) => {
        const activity = docSnap.data() as INotification;
        activities.push({ ...activity, id: docSnap.id });
      });

      return activities;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create notification
export const createNotification = createAsyncThunk(
  "admin/createNotification",
  async (
    notification: Omit<INotification, "id" | "createdAt">,
    { rejectWithValue }
  ) => {
    try {
      const docRef = await addDoc(collection(db, "notifications"), {
        ...notification,
        createdAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        ...notification,
        createdAt: serverTimestamp(),
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Mark notification as read
export const markNotificationAsRead = createAsyncThunk(
  "admin/markNotificationAsRead",
  async (notificationId: string, { rejectWithValue }) => {
    try {
      const notificationRef = doc(db, "notifications", notificationId);
      await updateDoc(notificationRef, {
        isRead: true,
        updatedAt: serverTimestamp(),
      });

      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get system settings
export const getSystemSettings = createAsyncThunk(
  "admin/getSystemSettings",
  async (_, { rejectWithValue }) => {
    try {
      const settingsRef = doc(db, "settings", "system");
      const snapshot = await getDoc(settingsRef);

      if (snapshot.exists()) {
        return snapshot.data() as ISettings;
      } else {
        // Return default settings if none exist
        const defaultSettings: ISettings = {
          siteName: "Firebase Commerce",
          siteDescription: "Complete ecommerce solution with Firebase",
          siteEmail: "admin@firebasecommerce.com",
          sitePhone: "+1 (555) 123-4567",
          siteAddress: "123 Commerce Street, City, State 12345",
          currency: "USD",
          taxRate: 0.08,
          shippingRate: 9.99,
          featuredProductsLimit: 8,
          allowUserRegistration: true,
          requireEmailVerification: false,
          maintenanceMode: false,
        };

        // Create default settings
        await setDoc(settingsRef, defaultSettings);
        return defaultSettings;
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update system settings
export const updateSystemSettings = createAsyncThunk(
  "admin/updateSystemSettings",
  async (settings: Partial<ISettings>, { rejectWithValue }) => {
    try {
      const settingsRef = doc(db, "settings", "system");
      await updateDoc(settingsRef, {
        ...settings,
        updatedAt: serverTimestamp(),
      });

      return settings;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Global search
export const globalSearch = createAsyncThunk(
  "admin/globalSearch",
  async (
    {
      searchTerm,
      collections = ["products", "orders", "users"],
    }: { searchTerm: string; collections?: string[] },
    { rejectWithValue }
  ) => {
    try {
      const searchResults: ISearchResult = {
        products: [],
        categories: [],
        brands: [],
        total: 0,
      };

      const searchPromises = collections.map(async (collectionName) => {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);

        const results: any[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const searchableText = JSON.stringify(data).toLowerCase();

          if (searchableText.includes(searchTerm.toLowerCase())) {
            results.push({ id: docSnap.id, ...data });
          }
        });

        return { collectionName, results };
      });

      const allResults = await Promise.all(searchPromises);

      allResults.forEach(({ collectionName, results }) => {
        if (collectionName === "products") {
          searchResults.products = results as IProduct[];
        } else if (collectionName === "categories") {
          searchResults.categories = results as ICategory[];
        } else if (collectionName === "brands") {
          searchResults.brands = results as IBrand[];
        }
      });

      searchResults.total =
        searchResults.products.length +
        searchResults.categories.length +
        searchResults.brands.length;

      return searchResults;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to calculate monthly stats
const calculateMonthlyStats = (orders: IOrder[]): IMonthlySales[] => {
  const monthlyData: { [key: string]: { sales: number; revenue: number } } = {};

  // Initialize last 12 months
  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthKey = date.toISOString().substring(0, 7); // YYYY-MM format
    monthlyData[monthKey] = { sales: 0, revenue: 0 };
  }

  // Process orders
  orders.forEach((order) => {
    if (order.createdAt && new Date(order.createdAt)) {
      const orderDate = new Date(order.createdAt);
      const monthKey = orderDate.toISOString().substring(0, 7);

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].sales += 1;
        monthlyData[monthKey].revenue += order.totalAmount;
      }
    }
  });

  // Convert to array format
  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    sales: data.sales,
    revenue: data.revenue,
  }));
};

// Admin slice
const adminSlice = createSlice({
  name: "admin",
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
    setUsers: (state, action: PayloadAction<IUserManagement[]>) => {
      state.users = action.payload;
    },
    setAnalytics: (state, action: PayloadAction<IAnalytics>) => {
      state.analytics = action.payload;
    },
    setDashboardStats: (state, action: PayloadAction<IDashboardStats>) => {
      state.dashboardStats = action.payload;
    },
    setUserStats: (state, action: PayloadAction<any>) => {
      state.userStats = action.payload;
    },
    setLowStockProducts: (state, action: PayloadAction<IInventoryItem[]>) => {
      state.lowStockProducts = action.payload;
    },
    setNotifications: (state, action: PayloadAction<INotification[]>) => {
      state.notifications = action.payload;
    },
    setSettings: (state, action: PayloadAction<ISettings>) => {
      state.settings = action.payload;
    },
    setAuditLogs: (state, action: PayloadAction<IAuditLog[]>) => {
      state.auditLogs = action.payload;
    },
    setSearchResults: (state, action: PayloadAction<ISearchResult>) => {
      state.searchResults = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = null;
    },
    setBackups: (state, action: PayloadAction<IBackup[]>) => {
      state.backups = action.payload;
    },
    setExportData: (state, action: PayloadAction<any[]>) => {
      state.exportData = action.payload;
    },
    clearExportData: (state) => {
      state.exportData = [];
      state.isExporting = false;
    },
    setIsExporting: (state, action: PayloadAction<boolean>) => {
      state.isExporting = action.payload;
    },
    addNotification: (state, action: PayloadAction<INotification>) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
    markNotificationRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },
    updateUserRole: (
      state,
      action: PayloadAction<{ userId: string; role: "admin" | "user" }>
    ) => {
      const { userId, role } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.role = role;
      }
    },
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; isActive: boolean }>
    ) => {
      const { userId, isActive } = action.payload;
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.isActive = isActive;
      }
    },
    removeUser: (state, action: PayloadAction<string>) => {
      const userId = action.payload;
      state.users = state.users.filter((u) => u.id !== userId);
    },
    addBackup: (state, action: PayloadAction<IBackup>) => {
      state.backups.unshift(action.payload);
    },
    removeBackup: (state, action: PayloadAction<string>) => {
      const backupId = action.payload;
      state.backups = state.backups.filter((b) => b.id !== backupId);
    },
    updateSettings: (state, action: PayloadAction<Partial<ISettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Dashboard analytics
      .addCase(getDashboardAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDashboardAnalytics.fulfilled, (state, action) => {
        state.analytics = action.payload;
        state.loading = false;
      })
      .addCase(getDashboardAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Dashboard stats
      .addCase(getDashboardStats.fulfilled, (state, action) => {
        state.dashboardStats = action.payload;
      })
      // Low stock products
      .addCase(getLowStockProducts.fulfilled, (state, action) => {
        state.lowStockProducts = action.payload;
      })
      // Recent activities
      .addCase(getRecentActivities.fulfilled, (state, action) => {
        state.notifications = action.payload;
      })
      // Create notification
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload as any);
      })
      // Mark notification as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find(
          (n) => n.id === action.payload
        );
        if (notification) {
          notification.isRead = true;
        }
      })
      // System settings
      .addCase(getSystemSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        if (state.settings) {
          state.settings = { ...state.settings, ...action.payload };
        }
      })
      // Global search
      .addCase(globalSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(globalSearch.fulfilled, (state, action) => {
        state.searchResults = action.payload;
        state.loading = false;
      })
      .addCase(globalSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setUsers,
  setAnalytics,
  setDashboardStats,
  setUserStats,
  setLowStockProducts,
  setNotifications,
  setSettings,
  setAuditLogs,
  setSearchResults,
  clearSearchResults,
  setBackups,
  setExportData,
  clearExportData,
  setIsExporting,
  addNotification,
  removeNotification,
  markNotificationRead,
  updateUserRole,
  updateUserStatus,
  removeUser,
  addBackup,
  removeBackup,
  updateSettings,
} = adminSlice.actions;

export default adminSlice.reducer;
