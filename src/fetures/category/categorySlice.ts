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
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

const db = getFirestore(firebaseApp);

interface CategoryState {
  categories: ICategory[];
  currentCategory: ICategory | null;
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
};

// Get all categories
export const getAllCategories = createAsyncThunk(
  "category/getAllCategories",
  async (_, { rejectWithValue }) => {
    try {
      const q = query(collection(db, "categories"), orderBy("name", "asc"));
      const snapshot = await getDocs(q);
      const categories: ICategory[] = [];

      snapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as ICategory);
      });

      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get active categories
export const getActiveCategories = createAsyncThunk(
  "category/getActiveCategories",
  async (_, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "categories"),
        where("isActive", "==", true),
        orderBy("name", "asc")
      );
      const snapshot = await getDocs(q);
      const categories: ICategory[] = [];

      snapshot.forEach((doc) => {
        categories.push({ id: doc.id, ...doc.data() } as ICategory);
      });

      return categories;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get single category
export const getCategory = createAsyncThunk(
  "category/getCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const categoryRef = doc(db, "categories", categoryId);
      const snapshot = await getDoc(categoryRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as ICategory;
      } else {
        return rejectWithValue("Category not found");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create category
export const createCategory = createAsyncThunk(
  "category/createCategory",
  async (
    categoryData: Omit<ICategory, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const docRef = await addDoc(collection(db, "categories"), {
        ...categoryData,
        productCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newCategory = {
        id: docRef.id,
        ...categoryData,
        productCount: 0,
      } as ICategory;
      return newCategory;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update category
export const updateCategory = createAsyncThunk(
  "category/updateCategory",
  async (
    { id, data }: { id: string; data: Partial<ICategory> },
    { rejectWithValue }
  ) => {
    try {
      const categoryRef = doc(db, "categories", id);
      await updateDoc(categoryRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return { id, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete category
export const deleteCategory = createAsyncThunk(
  "category/deleteCategory",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      const categoryRef = doc(db, "categories", categoryId);
      await deleteDoc(categoryRef);

      return categoryId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Toggle category status
export const toggleCategoryStatus = createAsyncThunk(
  "category/toggleCategoryStatus",
  async (
    { categoryId, isActive }: { categoryId: string; isActive: boolean },
    { rejectWithValue }
  ) => {
    try {
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        isActive,
        updatedAt: serverTimestamp(),
      });

      return { categoryId, isActive };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update category product count
export const updateCategoryProductCount = createAsyncThunk(
  "category/updateCategoryProductCount",
  async (categoryId: string, { rejectWithValue }) => {
    try {
      // Get products count for this category
      const productsQuery = query(
        collection(db, "products"),
        where("category", "==", categoryId)
      );
      const productsSnapshot = await getDocs(productsQuery);
      const productCount = productsSnapshot.size;

      // Update category with new product count
      const categoryRef = doc(db, "categories", categoryId);
      await updateDoc(categoryRef, {
        productCount,
        updatedAt: serverTimestamp(),
      });

      return { categoryId, productCount };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Category slice
const categorySlice = createSlice({
  name: "category",
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
    setCurrentCategory: (state, action: PayloadAction<ICategory | null>) => {
      state.currentCategory = action.payload;
    },
    clearCurrentCategory: (state) => {
      state.currentCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all categories
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get active categories
      .addCase(getActiveCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      // Get single category
      .addCase(getCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCategory.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
        state.loading = false;
      })
      .addCase(getCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create category
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.categories.push(action.payload);
        state.loading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update category
      .addCase(updateCategory.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.categories.findIndex((c) => c.id === id);
        if (index !== -1) {
          state.categories[index] = { ...state.categories[index], ...data };
        }
        if (state.currentCategory?.id === id) {
          state.currentCategory = { ...state.currentCategory, ...data };
        }
      })
      // Delete category
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const categoryId = action.payload;
        state.categories = state.categories.filter((c) => c.id !== categoryId);
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory = null;
        }
      })
      // Toggle category status
      .addCase(toggleCategoryStatus.fulfilled, (state, action) => {
        const { categoryId, isActive } = action.payload;
        const category = state.categories.find((c) => c.id === categoryId);
        if (category) {
          category.isActive = isActive;
        }
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory.isActive = isActive;
        }
      })
      // Update category product count
      .addCase(updateCategoryProductCount.fulfilled, (state, action) => {
        const { categoryId, productCount } = action.payload;
        const category = state.categories.find((c) => c.id === categoryId);
        if (category) {
          category.productCount = productCount;
        }
        if (state.currentCategory?.id === categoryId) {
          state.currentCategory.productCount = productCount;
        }
      });
  },
});

export const {
  setLoading,
  setError,
  clearError,
  setCurrentCategory,
  clearCurrentCategory,
} = categorySlice.actions;

export default categorySlice.reducer;
