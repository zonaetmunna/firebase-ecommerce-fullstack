"use client";
import {
  applyDiscountCode,
  clearCart,
  removeFromCart,
  setDiscountCode,
  setShippingCost,
  setShippingOption,
  updateQuantity,
} from "@/fetures/cart/cartSlice";
import { AppDispatch, RootState } from "@/fetures/store";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";

export default function Cart() {
  const { cart, total, subtotal, shippingOption, shippingCost, discountCode } =
    useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const handleRemoveFromCart = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleQuantityChange = ({
    id,
    quantity,
  }: {
    id: string;
    quantity: number;
  }) => {
    dispatch(updateQuantity({ id, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleApplyDiscountCode = () => {
    dispatch(applyDiscountCode({ discountCode: "EXAMPLE10" }));
  };
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>
      {cart.length === 0 ? (
        <p className="text-xl">Your cart is empty.</p>
      ) : (
        <div>
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Product</th>
                  <th className="py-2 px-4 text-left">Price</th>
                  <th className="py-2 px-4 text-left">Quantity</th>
                  <th className="py-2 px-4 text-left">Total</th>
                  <th className="py-2 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((item) => (
                  <tr key={item.id} className="border-b border-gray-300">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <Image
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 mr-4"
                        />
                        <div>
                          <h2 className="text-lg font-bold">{item.name}</h2>
                          <p className="text-gray-600">${item.price}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">${item.price}</td>
                    <td className="py-4 px-4">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(item.id, e.target.value)
                        }
                        min={1}
                        className="w-16 border border-gray-400 rounded px-2 py-1"
                      />
                    </td>
                    <td className="py-4 px-4">${item.price * item.quantity}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleRemoveFromCart(item.id)}
                        className="text-red-500 hover:text-red-600 font-bold"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-between items-center border-t border-gray-300 mt-8 pt-4">
            <button
              onClick={handleClearCart}
              className="text-red-500 hover:text-red-600 font-bold"
            >
              Clear Cart
            </button>
            <div className="text-xl font-bold">Subtotal: ${subtotal}</div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-300 mt-4 pt-4">
            <div>
              <label className="mr-2">Shipping Option:</label>
              <select
                value={shippingOption}
                onChange={(e) => dispatch(setShippingOption(e.target.value))}
                className="border border-gray-400 rounded px-2 py-1"
              >
                <option value="">Select Option</option>
                <option value="standard">Standard Shipping</option>
                <option value="express">Express Shipping</option>
              </select>
            </div>
            <div>
              <label className="mr-2">Shipping Cost:</label>
              <input
                type="number"
                value={shippingCost}
                onChange={(e) =>
                  dispatch(setShippingCost(Number(e.target.value)))
                }
                min={0}
                className="border border-gray-400 rounded px-2 py-1"
              />
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-gray-300 mt-4 pt-4">
            <div>
              <label className="mr-2">Discount Code:</label>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => dispatch(setDiscountCode(e.target.value))}
                className="border border-gray-400 rounded px-2 py-1"
              />
              <button
                onClick={handleApplyDiscountCode}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded-md ml-2"
              >
                Apply
              </button>
            </div>
            <div className="text-xl font-bold">Total: ${total}</div>
          </div>
        </div>
      )}
    </div>
  );
}
