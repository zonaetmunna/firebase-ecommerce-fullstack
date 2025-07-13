import firebaseApp from "@/firebase/firebase.config";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
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
  updateDoc,
} from "firebase/firestore";

const auth: Auth = getAuth(firebaseApp);
const db = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "admin" | "user";
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
}

interface UserState {
  currentUser: AuthUser | null;
  users: IUserManagement[];
  userStats: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    newUsersThisMonth: number;
  };
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const initialState: UserState = {
  currentUser: null,
  users: [],
  userStats: {
    totalUsers: 0,
    activeUsers: 0,
    adminUsers: 0,
    newUsersThisMonth: 0,
  },
  loading: false,
  error: null,
  isAuthenticated: false,
  isAdmin: false,
};

// Create user document in Firestore
const createUserDocument = async (user: any, additionalData?: any) => {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    const { displayName, email, photoURL } = user;
    const createdAt = serverTimestamp();

    // First user becomes admin
    const usersQuery = query(collection(db, "users"), limit(1));
    const usersSnapshot = await getDocs(usersQuery);
    const isFirstUser = usersSnapshot.empty;

    await setDoc(userRef, {
      displayName,
      email,
      photoURL,
      role: isFirstUser ? "admin" : "user",
      isActive: true,
      createdAt,
      updatedAt: createdAt,
      ...additionalData,
    });
  }

  return userRef;
};

// Get user document from Firestore
const getUserDocument = async (uid: string): Promise<AuthUser | null> => {
  if (!uid) return null;

  try {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);

    if (snapshot.exists()) {
      return {
        uid,
        ...snapshot.data(),
      } as AuthUser;
    }

    return null;
  } catch (error) {
    console.error("Error getting user document:", error);
    return null;
  }
};

// Async thunks
export const login = createAsyncThunk(
  "user/login",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { user } = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Get user document from Firestore
      const userDoc = await getUserDocument(user.uid);

      return userDoc;
    } catch (error: any) {
      return rejectWithValue(error.message as string);
    }
  }
);

export const signup = createAsyncThunk(
  "user/signup",
  async (
    userData: { email: string; password: string; displayName: string },
    { rejectWithValue }
  ) => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // Update profile with display name
      await updateProfile(user, { displayName: userData.displayName });
      await createUserDocument(user, { displayName: userData.displayName });

      // Get user document from Firestore
      const userDoc = await getUserDocument(user.uid);

      return userDoc;
    } catch (error: any) {
      return rejectWithValue(error.message as string);
    }
  }
);

export const signInWithFacebook = createAsyncThunk(
  "user/signInWithFacebook",
  async (_, { rejectWithValue }) => {
    try {
      const { user } = await signInWithPopup(auth, facebookProvider);
      await createUserDocument(user);

      // Get user document from Firestore
      const userDoc = await getUserDocument(user.uid);

      return userDoc;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  "user/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const { user } = await signInWithPopup(auth, googleProvider);
      await createUserDocument(user);

      // Get user document from Firestore
      const userDoc = await getUserDocument(user.uid);

      return userDoc;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const refreshUserData = createAsyncThunk(
  "user/refreshUserData",
  async (uid: string, { rejectWithValue }) => {
    try {
      const userDoc = await getUserDocument(uid);
      return userDoc;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetPassword = createAsyncThunk(
  "user/resetPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: "Password reset email sent" };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Admin operations
export const getAllUsers = createAsyncThunk(
  "user/getAllUsers",
  async (_, { rejectWithValue }) => {
    try {
      const usersQuery = query(
        collection(db, "users"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(usersQuery);

      const users: IUserManagement[] = [];
      snapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          displayName: userData.displayName || null,
          email: userData.email || null,
          role: userData.role || "user",
          isActive: userData.isActive || true,
          createdAt: userData.createdAt,
          totalOrders: userData.totalOrders || 0,
          totalSpent: userData.totalSpent || 0,
        });
      });

      return users;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "user/updateUserRole",
  async (
    { userId, newRole }: { userId: string; newRole: "admin" | "user" },
    { rejectWithValue }
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });

      return { userId, role: newRole };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const toggleUserStatus = createAsyncThunk(
  "user/toggleUserStatus",
  async (
    { userId, isActive }: { userId: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });

      return { userId, isActive };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (userId: string, { rejectWithValue }) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return userId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getUserStats = createAsyncThunk(
  "user/getUserStats",
  async (_, { rejectWithValue }) => {
    try {
      const usersQuery = query(collection(db, "users"));
      const snapshot = await getDocs(usersQuery);

      let totalUsers = 0;
      let activeUsers = 0;
      let adminUsers = 0;
      let newUsersThisMonth = 0;

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      snapshot.forEach((doc) => {
        const userData = doc.data();
        totalUsers++;

        if (userData.isActive) activeUsers++;
        if (userData.role === "admin") adminUsers++;

        if (userData.createdAt) {
          const createdDate = userData.createdAt.toDate();
          if (
            createdDate.getMonth() === currentMonth &&
            createdDate.getFullYear() === currentYear
          ) {
            newUsersThisMonth++;
          }
        }
      });

      return {
        totalUsers,
        activeUsers,
        adminUsers,
        newUsersThisMonth,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<AuthUser | null>) {
      state.currentUser = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isAdmin = action.payload?.role === "admin";
      state.loading = false;
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.loading = false;
    },
    clearError(state) {
      state.error = null;
    },
    updateUserProfile(state, action: PayloadAction<Partial<AuthUser>>) {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    setAuthenticated(state, action: PayloadAction<boolean>) {
      state.isAuthenticated = action.payload;
    },
    setAdmin(state, action: PayloadAction<boolean>) {
      state.isAdmin = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.role === "admin";
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.role === "admin";
        state.loading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Facebook
      .addCase(signInWithFacebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithFacebook.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.role === "admin";
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithFacebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Google
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.role === "admin";
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isAdmin = false;
      })
      // Logout
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Refresh user data
      .addCase(refreshUserData.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.isAuthenticated = true;
        state.isAdmin = action.payload?.role === "admin";
      })
      // Get all users
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user role
      .addCase(updateUserRole.fulfilled, (state, action) => {
        const { userId, role } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.role = role;
        }
      })
      // Toggle user status
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const { userId, isActive } = action.payload;
        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.isActive = isActive;
        }
      })
      // Delete user
      .addCase(deleteUser.fulfilled, (state, action) => {
        const userId = action.payload;
        state.users = state.users.filter((u) => u.id !== userId);
      })
      // Get user stats
      .addCase(getUserStats.fulfilled, (state, action) => {
        state.userStats = action.payload;
      });
  },
});

export const {
  setUser,
  setLoading,
  setError,
  clearError,
  updateUserProfile,
  setAuthenticated,
  setAdmin,
} = userSlice.actions;

export default userSlice.reducer;
