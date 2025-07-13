"use client";

import { addToCart } from "@/fetures/cart/cartSlice";
import { RootState } from "@/fetures/store";
import {
  clearWishlist,
  removeFromWishlist,
} from "@/fetures/wishlist/wishlistSlice";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaHeart, FaShoppingCart, FaStar, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

export default function WishlistPage() {
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const { wishlist } = useSelector((state: RootState) => state.wishlist);
  const { cart } = useSelector((state: RootState) => state.cart);
  const { currentUser } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  const handleAddToCart = (product: IProduct) => {
    dispatch(addToCart(product));
    toast.success(`${product.name} added to cart!`);
  };

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId));
    toast.success("Item removed from wishlist");
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
    toast.success("Wishlist cleared");
  };

  const isInCart = (productId: string) => {
    return cart.some((item: IProduct) => item.id === productId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              My Wishlist
            </h1>
            <p className="text-gray-600">
              {wishlist.length} {wishlist.length === 1 ? "item" : "items"} in
              your wishlist
            </p>
          </div>

          {wishlist.length > 0 && (
            <button
              onClick={handleClearWishlist}
              className="flex items-center px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <FaTrash className="mr-2" size={16} />
              Clear Wishlist
            </button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaHeart size={32} className="text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Your wishlist is empty
              </h2>
              <p className="text-gray-600 mb-6">
                Start adding items to your wishlist by clicking the heart icon
                on products you love.
              </p>
              <Link
                href="/products"
                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wishlist.map((product: IProduct) => (
                <div
                  key={product.id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="relative">
                    <Link href={`/product/${product.id}`}>
                      <Image
                        src={product.image || "/placeholder-image.jpg"}
                        alt={product.name}
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    <button
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <FaHeart size={16} />
                    </button>
                  </div>

                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            size={12}
                            className={
                              i < product.rating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-2">
                        ({product.rating})
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-gray-800">
                        {formatPrice(product.price)}
                      </span>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={isInCart(product.id) || product.stock === 0}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          isInCart(product.id)
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : product.stock === 0
                            ? "bg-red-300 text-red-600 cursor-not-allowed"
                            : "bg-blue-600 text-white hover:bg-blue-700"
                        }`}
                      >
                        {isInCart(product.id)
                          ? "In Cart"
                          : product.stock === 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Wishlist Actions */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Wishlist Actions
              </h2>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => {
                    const availableItems = wishlist.filter(
                      (item: IProduct) => !isInCart(item.id) && item.stock > 0
                    );

                    if (availableItems.length === 0) {
                      toast.error("No items available to add to cart");
                      return;
                    }

                    availableItems.forEach((item: IProduct) => {
                      dispatch(addToCart(item));
                    });

                    toast.success(
                      `${availableItems.length} items added to cart!`
                    );
                  }}
                  className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaShoppingCart className="mr-2" size={16} />
                  Add All to Cart
                </button>

                <Link
                  href="/products"
                  className="flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* Wishlist Stats */}
            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Wishlist Summary
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {wishlist.length}
                  </div>
                  <div className="text-sm text-gray-600">Total Items</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatPrice(
                      wishlist.reduce(
                        (total: number, item: IProduct) => total + item.price,
                        0
                      )
                    )}
                  </div>
                  <div className="text-sm text-gray-600">Total Value</div>
                </div>

                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {wishlist.filter((item: IProduct) => item.stock > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Available Items</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
