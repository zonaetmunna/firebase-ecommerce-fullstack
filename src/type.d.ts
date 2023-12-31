interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: string;
  // Add any other properties you want to store for the user
}

/* products interface */
interface IProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  color: string;
  size: string;
  stock: number;
  image: string;
  rating: number;
  brand: string;
  quantity?: number;
}
/* category interface */
interface ICategory {
  id: string;
  name: string;
  description: string;
  image: string;
}
/* brand interface */
interface IBrand {
  id: string;
  name: string;
  description: string;
  logo: string;
}
/* order interface */
interface IOrder {
  id: string;
  userId: string;
  products: Product[]; // Assuming that the "Product" type is the same as the one we defined earlier
  totalAmount: number;
  orderDate: firebase.firestore.Timestamp; // Use Firestore Timestamp for date and time
  shippingAddress: string;
  status: "pending" | "shipped" | "delivered";
}

// cart
interface ICartState {
  cart: IProduct[];
  shippingOption: string;
  shippingCost: number;
  discountCode: string;
  subtotal: number;
  total: number;
  billingAddress: IBillingAddress;
}

interface IBillingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  city?: string;
  zip?: number;
}

// ----------wishlist-------//
interface IWishlistState {
  wishlist: IProduct[];
}
