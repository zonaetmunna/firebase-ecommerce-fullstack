"use client";

import { addToCart } from "@/fetures/cart/cartSlice";
import { getProduct } from "@/fetures/product/productSlice";
import { RootState } from "@/fetures/store";
import { addToWishlist } from "@/fetures/wishlist/wishlistSlice";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiArrowLeft,
  FiHeart,
  FiRefreshCw,
  FiShield,
  FiShoppingCart,
  FiStar,
  FiTruck,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const params = useParams();
  const productId = params.id as string;

  const { currentProduct, loading } = useSelector(
    (state: RootState) => state.product
  );
  const { cart } = useSelector((state: RootState) => state.cart);
  const { wishlist } = useSelector((state: RootState) => state.wishlist);

  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    dispatch(getProduct(productId) as any);
  }, [dispatch, productId]);

  useEffect(() => {
    if (currentProduct) {
      setSelectedImage(currentProduct.image);
      setSelectedSize(currentProduct.size || "");
      setSelectedColor(currentProduct.color || "");
    }
  }, [currentProduct]);

  const handleAddToCart = () => {
    if (!currentProduct) return;

    const productToAdd = {
      ...currentProduct,
      quantity,
      selectedSize,
      selectedColor,
    };

    dispatch(addToCart(productToAdd));
    toast.success(`${currentProduct.name} added to cart!`);
  };

  const handleAddToWishlist = () => {
    if (!currentProduct) return;

    dispatch(addToWishlist(currentProduct));
    toast.success(`${currentProduct.name} added to wishlist!`);
  };

  const isInCart = () => {
    return cart.some((item) => item.id === productId);
  };

  const isInWishlist = () => {
    return wishlist.some((item: IProduct) => item.id === productId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h1>
          <Link href="/products" className="text-blue-600 hover:text-blue-800">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-8">
        <Link
          href="/products"
          className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          Back to Products
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={selectedImage}
              alt={currentProduct.name}
              width={600}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Image Gallery */}
          {currentProduct.images && currentProduct.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => setSelectedImage(currentProduct.image)}
                className={`aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === currentProduct.image
                    ? "border-blue-600"
                    : "border-gray-200"
                }`}
              >
                <Image
                  src={currentProduct.image}
                  alt={currentProduct.name}
                  width={120}
                  height={120}
                  className="w-full h-full object-cover"
                />
              </button>
              {currentProduct.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(image)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 ${
                    selectedImage === image
                      ? "border-blue-600"
                      : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${currentProduct.name} ${index + 1}`}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentProduct.name}
            </h1>
            <p className="text-gray-600 mb-4">{currentProduct.brand}</p>

            {/* Rating */}
            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < currentProduct.rating
                        ? "text-yellow-400 fill-current"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">
                  ({currentProduct.rating})
                </span>
              </div>
            </div>

            <div className="text-3xl font-bold text-blue-600 mb-6">
              ${currentProduct.price}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {currentProduct.description}
            </p>
          </div>

          {/* Size Selection */}
          {currentProduct.size && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Size</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedSize(currentProduct.size)}
                  className={`px-4 py-2 border rounded-lg ${
                    selectedSize === currentProduct.size
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {currentProduct.size}
                </button>
              </div>
            </div>
          )}

          {/* Color Selection */}
          {currentProduct.color && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Color</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedColor(currentProduct.color)}
                  className={`px-4 py-2 border rounded-lg ${
                    selectedColor === currentProduct.color
                      ? "border-blue-600 bg-blue-50 text-blue-600"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {currentProduct.color}
                </button>
              </div>
            </div>
          )}

          {/* Quantity */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Quantity</h3>
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  -
                </button>
                <span className="px-4 py-2 border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(currentProduct.stock, quantity + 1))
                  }
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-600">
                {currentProduct.stock} available
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                currentProduct.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {currentProduct.stock > 0 ? "In Stock" : "Out of Stock"}
            </span>
          </div>

          {/* Add to Cart and Wishlist */}
          <div className="flex space-x-4">
            <button
              onClick={handleAddToCart}
              disabled={currentProduct.stock === 0 || isInCart()}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-6 rounded-lg font-semibold transition-colors ${
                currentProduct.stock === 0 || isInCart()
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              <FiShoppingCart className="w-5 h-5" />
              <span>{isInCart() ? "Already in Cart" : "Add to Cart"}</span>
            </button>

            <button
              onClick={handleAddToWishlist}
              className={`px-6 py-3 border rounded-lg transition-colors ${
                isInWishlist()
                  ? "border-red-600 bg-red-50 text-red-600"
                  : "border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-600"
              }`}
            >
              <FiHeart className="w-5 h-5" />
            </button>
          </div>

          {/* Product Features */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Product Features</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <FiTruck className="w-5 h-5 text-blue-600" />
                <span className="text-sm">
                  Free shipping on orders over $50
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <FiShield className="w-5 h-5 text-blue-600" />
                <span className="text-sm">1 year warranty</span>
              </div>
              <div className="flex items-center space-x-3">
                <FiRefreshCw className="w-5 h-5 text-blue-600" />
                <span className="text-sm">30-day return policy</span>
              </div>
            </div>
          </div>

          {/* Specifications */}
          {currentProduct.specifications &&
            Object.keys(currentProduct.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Specifications</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 gap-3">
                    {Object.entries(currentProduct.specifications).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="font-medium text-gray-700">
                            {key}:
                          </span>
                          <span className="text-gray-600">{value}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

          {/* Tags */}
          {currentProduct.tags && currentProduct.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {currentProduct.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
