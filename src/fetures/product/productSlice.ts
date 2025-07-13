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
  updateDoc,
  where,
} from "firebase/firestore";

const db = getFirestore(firebaseApp);

interface ProductState {
  products: IProduct[];
  currentProduct: IProduct | null;
  featuredProducts: IProduct[];
  topProducts: IProduct[];
  categories: ICategory[];
  brands: IBrand[];
  filters: IProductFilter;
  pagination: IPagination;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  currentProduct: null,
  featuredProducts: [],
  topProducts: [],
  categories: [],
  brands: [],
  filters: {
    sortBy: "newest",
    sortOrder: "desc",
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    hasNext: false,
    hasPrev: false,
  },
  loading: false,
  error: null,
};

// Get all products
export const getAllProducts = createAsyncThunk(
  "product/getAllProducts",
  async (
    {
      page = 1,
      limitCount = 12,
      filters = {},
    }: { page?: number; limitCount?: number; filters?: IProductFilter },
    { rejectWithValue }
  ) => {
    try {
      let q = query(collection(db, "products"));

      // Apply filters
      if (filters.category) {
        q = query(q, where("category", "==", filters.category));
      }
      if (filters.brand) {
        q = query(q, where("brand", "==", filters.brand));
      }
      if (filters.minPrice || filters.maxPrice) {
        if (filters.minPrice) {
          q = query(q, where("price", ">=", filters.minPrice));
        }
        if (filters.maxPrice) {
          q = query(q, where("price", "<=", filters.maxPrice));
        }
      }
      if (filters.rating) {
        q = query(q, where("rating", ">=", filters.rating));
      }

      // Apply sorting
      if (filters.sortBy) {
        const sortField =
          filters.sortBy === "newest"
            ? "createdAt"
            : filters.sortBy === "oldest"
            ? "createdAt"
            : filters.sortBy;
        const sortOrder = filters.sortOrder === "desc" ? "desc" : "asc";
        q = query(q, orderBy(sortField, sortOrder));
      }

      // Apply pagination
      q = query(q, limit(limitCount));

      const snapshot = await getDocs(q);
      const products: IProduct[] = [];

      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as IProduct);
      });

      // Get total count for pagination
      const totalSnapshot = await getDocs(collection(db, "products"));
      const total = totalSnapshot.size;

      return {
        products,
        pagination: {
          page,
          limit: limitCount,
          total,
          hasNext: page * limitCount < total,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get single product
export const getProduct = createAsyncThunk(
  "product/getProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      const productRef = doc(db, "products", productId);
      const snapshot = await getDoc(productRef);

      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as IProduct;
      } else {
        return rejectWithValue("Product not found");
      }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Create product
export const createProduct = createAsyncThunk(
  "product/createProduct",
  async (
    productData: Omit<IProduct, "id" | "createdAt" | "updatedAt">,
    { rejectWithValue }
  ) => {
    try {
      const docRef = await addDoc(collection(db, "products"), {
        ...productData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const newProduct = { id: docRef.id, ...productData } as IProduct;
      return newProduct;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Update product
export const updateProduct = createAsyncThunk(
  "product/updateProduct",
  async (
    { id, data }: { id: string; data: Partial<IProduct> },
    { rejectWithValue }
  ) => {
    try {
      const productRef = doc(db, "products", id);
      await updateDoc(productRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      return { id, data };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Delete product
export const deleteProduct = createAsyncThunk(
  "product/deleteProduct",
  async (productId: string, { rejectWithValue }) => {
    try {
      const productRef = doc(db, "products", productId);
      await deleteDoc(productRef);

      return productId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get featured products
export const getFeaturedProducts = createAsyncThunk(
  "product/getFeaturedProducts",
  async (limitCount: number = 8, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "products"),
        where("featured", "==", true),
        orderBy("createdAt", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const products: IProduct[] = [];

      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as IProduct);
      });

      return products;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Get top products
export const getTopProducts = createAsyncThunk(
  "product/getTopProducts",
  async (limitCount: number = 10, { rejectWithValue }) => {
    try {
      const q = query(
        collection(db, "products"),
        orderBy("rating", "desc"),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      const products: IProduct[] = [];

      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() } as IProduct);
      });

      return products;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Search products
export const searchProducts = createAsyncThunk(
  "product/searchProducts",
  async (searchTerm: string, { rejectWithValue }) => {
    try {
      const q = query(collection(db, "products"));
      const snapshot = await getDocs(q);
      const products: IProduct[] = [];

      snapshot.forEach((doc) => {
        const product = { id: doc.id, ...doc.data() } as IProduct;
        const searchableText =
          `${product.name} ${product.description} ${product.category} ${product.brand}`.toLowerCase();

        if (searchableText.includes(searchTerm.toLowerCase())) {
          products.push(product);
        }
      });

      return products;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Bulk update products
export const bulkUpdateProducts = createAsyncThunk(
  "product/bulkUpdateProducts",
  async (
    updates: { id: string; data: Partial<IProduct> }[],
    { rejectWithValue }
  ) => {
    try {
      const updatePromises = updates.map(({ id, data }) => {
        const productRef = doc(db, "products", id);
        return updateDoc(productRef, {
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

// Product slice
const productSlice = createSlice({
  name: "product",
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
    setFilters: (state, action: PayloadAction<IProductFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        sortBy: "newest",
        sortOrder: "desc",
      };
    },
    setCurrentProduct: (state, action: PayloadAction<IProduct | null>) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all products
      .addCase(getAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(getAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Get single product
      .addCase(getProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
        state.loading = false;
      })
      .addCase(getProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create product
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update product
      .addCase(updateProduct.fulfilled, (state, action) => {
        const { id, data } = action.payload;
        const index = state.products.findIndex((p) => p.id === id);
        if (index !== -1) {
          state.products[index] = { ...state.products[index], ...data };
        }
        if (state.currentProduct?.id === id) {
          state.currentProduct = { ...state.currentProduct, ...data };
        }
      })
      // Delete product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        const productId = action.payload;
        state.products = state.products.filter((p) => p.id !== productId);
        if (state.currentProduct?.id === productId) {
          state.currentProduct = null;
        }
      })
      // Get featured products
      .addCase(getFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload;
      })
      // Get top products
      .addCase(getTopProducts.fulfilled, (state, action) => {
        state.topProducts = action.payload;
      })
      // Search products
      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.products = action.payload;
        state.loading = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Bulk update products
      .addCase(bulkUpdateProducts.fulfilled, (state, action) => {
        action.payload.forEach(({ id, data }) => {
          const index = state.products.findIndex((p) => p.id === id);
          if (index !== -1) {
            state.products[index] = { ...state.products[index], ...data };
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
  setCurrentProduct,
  clearCurrentProduct,
} = productSlice.actions;

export default productSlice.reducer;
