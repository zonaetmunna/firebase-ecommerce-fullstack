import firebaseApp from "@/firebase/firebase.config";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  Auth,
  FacebookAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { AppThunk } from "../store";

const auth: Auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

interface UserState {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk(
  "user/login",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await signInWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message as string);
    }
  }
);

export const signup = createAsyncThunk(
  "user/signup",
  async (
    userData: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message as string);
    }
  }
);

export const signInWithFacebook = createAsyncThunk(
  "user/signInWithFacebook",
  async (_, { rejectWithValue }) => {
    try {
      const response = await signInWithPopup(auth, facebookProvider);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInWithGoogle = createAsyncThunk(
  "user/signInWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const response = await signInWithPopup(auth, googleProvider);
      return response.user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk("user/logout", async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    return error.message;
  }
});

// "subscribedUser" action can be used to update the user state after successful authentication or subscription
export const subscribedUser =
  (user: User | null): AppThunk =>
  (dispatch) => {
    dispatch(setUser(user));
  };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
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
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signInWithFacebook.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithFacebook.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithFacebook.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(signInWithGoogle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInWithGoogle.fulfilled, (state, action) => {
        state.currentUser = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.loading = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setUser, setLoading, setError } = userSlice.actions;

export default userSlice.reducer;
