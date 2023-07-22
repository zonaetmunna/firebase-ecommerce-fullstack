import {
  clearCart,
  removeFromCart,
  updateQuantity,
} from "@/fetures/cart/cartSlice";
import { AppDispatch, RootState } from "@/fetures/store";
import Image from "next/image";
import Link from "next/link";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

interface CartModalProps {
  onClose: () => void;
}

export default function CartModal({ onClose }: CartModalProps) {
  const { cart } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = (id: string, quantity: number) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 backdrop-filter backdrop-blur-lg">
      <div className="bg-white rounded-lg shadow-lg p-6 absolute right-0 h-screen">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Your Cart</h3>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        {cart.length > 0 ? (
          <div>
            {cart.map((item: IProduct) => (
              <div key={item.id} className="flex items-center mb-2">
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-12 h-12 mr-2 object-cover"
                  width={100}
                  height={100}
                />
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-500">{item.price}</p>
                </div>
                <div>
                  <input
                    type="number"
                    value={item.stock}
                    onChange={(e) =>
                      handleQuantityChange(item.id, parseInt(e.target.value))
                    }
                    className="w-16 p-2 border border-gray-300 rounded"
                  />
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="ml-2 text-red-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="mt-4">
              <button
                onClick={handleClearCart}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Clear Cart
              </button>
            </div>
          </div>
        ) : (
          <p>Your cart is empty.</p>
        )}
        {/* ... */}
        <div className="mt-6 flex justify-between items-center">
          <Link
            href="/cart"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2
            rounded"
          >
            Cart
          </Link>
          <Link
            href="/checkout"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2
            rounded"
          >
            Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}
