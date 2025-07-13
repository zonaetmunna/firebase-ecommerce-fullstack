"use client";

import {
  addToBillingAddress,
  applyDiscountCode,
  clearCart,
  setShippingCost,
  setShippingOption,
  setSubtotal,
  setTotal,
} from "@/fetures/cart/cartSlice";
import { createOrder } from "@/fetures/order/orderSlice";
import { RootState } from "@/fetures/store";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  FaArrowLeft,
  FaCreditCard,
  FaPaypal,
  FaShieldAlt,
  FaTruck,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";

interface CheckoutFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  paymentMethod: "credit_card" | "paypal" | "stripe";
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const {
    cart,
    subtotal,
    shippingCost,
    shippingOption,
    total,
    billingAddress,
  } = useSelector((state: RootState) => state.cart);
  const { currentUser } = useSelector((state: RootState) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>();

  const watchedPaymentMethod = watch("paymentMethod");

  useEffect(() => {
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }

    if (!currentUser) {
      router.push("/login");
      return;
    }

    // Calculate subtotal
    dispatch(setSubtotal());
    // Set default shipping if not set
    if (!shippingOption) {
      dispatch(setShippingOption("standard"));
      dispatch(setShippingCost(9.99));
    }
    dispatch(setTotal());
  }, [cart, currentUser, router, dispatch, shippingOption]);

  useEffect(() => {
    // Update billing address with user info if available
    if (currentUser) {
      setValue("firstName", currentUser.displayName?.split(" ")[0] || "");
      setValue("lastName", currentUser.displayName?.split(" ")[1] || "");
      setValue("email", currentUser.email || "");
    }
  }, [currentUser, setValue]);

  const shippingOptions = [
    {
      id: "standard",
      name: "Standard Shipping",
      price: 9.99,
      time: "5-7 business days",
    },
    {
      id: "express",
      name: "Express Shipping",
      price: 19.99,
      time: "2-3 business days",
    },
    {
      id: "overnight",
      name: "Overnight Shipping",
      price: 39.99,
      time: "Next business day",
    },
  ];

  const handleShippingChange = (option: (typeof shippingOptions)[0]) => {
    dispatch(setShippingOption(option.id));
    dispatch(setShippingCost(option.price));
    dispatch(setTotal());
  };

  const handleApplyDiscount = () => {
    if (discountCode.toUpperCase() === "EXAMPLE10") {
      dispatch(applyDiscountCode({ discountCode: discountCode.toUpperCase() }));
      setAppliedDiscount(true);
      toast.success("Discount code applied!");
    } else {
      toast.error("Invalid discount code");
    }
  };

  const onSubmit = async (data: CheckoutFormData) => {
    if (currentStep === 1) {
      // Save billing address and move to payment
      const billingData: IBillingAddress = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        zip: parseInt(data.zipCode),
        country: data.country,
      };

      dispatch(addToBillingAddress(billingData));
      setCurrentStep(2);
    } else {
      // Process payment and create order
      setLoading(true);
      try {
        // Create order
        const orderData = {
          userId: currentUser!.uid,
          items: cart.map((item) => ({
            productId: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity || 1,
            image: item.image,
            size: item.size,
            color: item.color,
          })),
          totalAmount: total,
          subtotal: subtotal,
          shippingCost: shippingCost,
          tax: 0,
          billingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            zip: parseInt(data.zipCode),
            country: data.country,
          },
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            zip: parseInt(data.zipCode),
            country: data.country,
          },
          paymentMethod: data.paymentMethod,
          paymentStatus: "pending" as const,
          orderStatus: "pending" as const,
        };

        const orderId = await createOrder(orderData);

        // Update product stock
        for (const item of cart) {
          await updateProductStock(item.id, item.quantity || 1);
        }

        // Clear cart
        dispatch(clearCart());

        toast.success("Order placed successfully!");
        router.push(`/orders/${orderId}`);
      } catch (error) {
        console.error("Error creating order:", error);
        toast.error("Failed to place order");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const steps = [
    { number: 1, title: "Shipping Info", completed: currentStep > 1 },
    { number: 2, title: "Payment", completed: false },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <FaArrowLeft className="mr-2" size={16} />
          Back to Cart
        </button>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.number
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.number}
              </div>
              <span
                className={`ml-2 text-sm ${
                  currentStep >= step.number ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
              {index < steps.length - 1 && (
                <div
                  className={`w-12 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-blue-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              {currentStep === 1 ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Shipping Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <input
                        {...register("firstName", {
                          required: "First name is required",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.firstName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.firstName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <input
                        {...register("lastName", {
                          required: "Last name is required",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.lastName && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.lastName.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        })}
                        type="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.email && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone
                      </label>
                      <input
                        {...register("phone", {
                          required: "Phone number is required",
                        })}
                        type="tel"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.phone && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      {...register("address", {
                        required: "Address is required",
                      })}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.address && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        {...register("city", { required: "City is required" })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.city && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.city.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        {...register("state", {
                          required: "State is required",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.state && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.state.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        {...register("zipCode", {
                          required: "ZIP code is required",
                        })}
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.zipCode && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.zipCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      {...register("country", {
                        required: "Country is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                    {errors.country && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.country.message}
                      </p>
                    )}
                  </div>

                  {/* Shipping Options */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Shipping Options
                    </h3>
                    <div className="space-y-3">
                      {shippingOptions.map((option) => (
                        <div
                          key={option.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            shippingOption === option.id
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-300 hover:border-gray-400"
                          }`}
                          onClick={() => handleShippingChange(option)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <input
                                type="radio"
                                checked={shippingOption === option.id}
                                onChange={() => handleShippingChange(option)}
                                className="mr-3"
                              />
                              <div>
                                <div className="flex items-center">
                                  <FaTruck
                                    className="mr-2 text-gray-600"
                                    size={16}
                                  />
                                  <span className="font-medium">
                                    {option.name}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {option.time}
                                </p>
                              </div>
                            </div>
                            <span className="font-semibold">
                              {formatPrice(option.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Payment Information
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center">
                        <input
                          {...register("paymentMethod", {
                            required: "Please select a payment method",
                          })}
                          type="radio"
                          value="credit_card"
                          className="mr-3"
                        />
                        <FaCreditCard
                          className="mr-2 text-gray-600"
                          size={16}
                        />
                        <span>Credit Card</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          {...register("paymentMethod")}
                          type="radio"
                          value="paypal"
                          className="mr-3"
                        />
                        <FaPaypal className="mr-2 text-blue-600" size={16} />
                        <span>PayPal</span>
                      </div>
                    </div>
                    {errors.paymentMethod && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>

                  {watchedPaymentMethod === "credit_card" && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Card Number
                        </label>
                        <input
                          {...register("cardNumber", {
                            required: "Card number is required",
                          })}
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.cardNumber && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.cardNumber.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Expiry Date
                          </label>
                          <input
                            {...register("expiryDate", {
                              required: "Expiry date is required",
                            })}
                            type="text"
                            placeholder="MM/YY"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.expiryDate && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.expiryDate.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            CVV
                          </label>
                          <input
                            {...register("cvv", {
                              required: "CVV is required",
                            })}
                            type="text"
                            placeholder="123"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          {errors.cvv && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.cvv.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cardholder Name
                        </label>
                        <input
                          {...register("cardName", {
                            required: "Cardholder name is required",
                          })}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.cardName && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.cardName.message}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-600">
                    <FaShieldAlt className="mr-2" size={16} />
                    <span>
                      Your payment information is secure and encrypted
                    </span>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Processing..." : "Place Order"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center space-x-4">
                  <Image
                    src={item.image || "/placeholder-image.jpg"}
                    alt={item.name}
                    width={60}
                    height={60}
                    className="w-15 h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-600">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(item.price * (item.quantity || 1))}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax</span>
                <span>{formatPrice(0)}</span>
              </div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            {/* Discount Code */}
            {!appliedDiscount && (
              <div className="mt-6 pt-4 border-t">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Discount code"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
