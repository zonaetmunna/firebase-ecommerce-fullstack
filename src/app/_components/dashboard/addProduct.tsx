"use client";
import { Dialog } from "@headlessui/react";

import { useForm } from "react-hook-form";
import Select, { ActionMeta, ValueType } from "react-select";

interface AddProductProps {
  onClose: () => void;
  onAdd: (newProductData: NewProductData) => void;
}
interface NewProductData {
  name: string;
  price: number;
  description: string;
  category: string;
  color: string;
  size: string;
  stock: number;
  image: string;
  rating?: number;
  brand: string;
}

// Interface for the options array
interface Option {
  value: string;
  label: string;
}
export default function AddProduct({ onClose, onAdd }: AddProductProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<NewProductData>();

  const onSubmit = (formData: NewProductData) => {
    // Call the onAdd function with the new product data
    onAdd(formData);
    // Reset the form after submission
    reset();
  };

  const categoryOptions: Option[] = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "furniture", label: "Furniture" },
    // Add more options as needed
  ];

  const colorOptions: Option[] = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    // Add more options as needed
  ];

  const sizeOptions: Option[] = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    // Add more options as needed
  ];

  const handleCategoryChange = (
    value: ValueType<Option, false>,
    actionMeta: ActionMeta<Option>
  ) => {
    // Use react-hook-form setValue to set the value for the "category" field
    setValue("category", value ? value.value : "");
  };

  const handleColorChange = (
    value: ValueType<Option, false>,
    actionMeta: ActionMeta<Option>
  ) => {
    // Use react-hook-form setValue to set the value for the "color" field
    setValue("color", value ? value.value : "");
  };

  const handleSizeChange = (
    value: ValueType<Option, false>,
    actionMeta: ActionMeta<Option>
  ) => {
    // Use react-hook-form setValue to set the value for the "size" field
    setValue("size", value ? value.value : "");
  };
  return (
    <Dialog open onClose={onClose} className="fixed inset-0 z-50">
      <Dialog.Overlay className="fixed inset-0 bg-white opacity-50" />
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="flex flex-col justify-center items-center w-full max-w-md  overflow-hidden">
          {/* Main content container */}
          <div className="bg-white p-4 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Product</h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex justify-center items-center">
                {/* name */}{" "}
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium">
                    Name:
                  </label>
                  <input
                    type="text"
                    {...register("name", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
                {/* description */}
                <div className="mb-4">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium"
                  >
                    Description:
                  </label>
                  <input
                    type="text"
                    {...register("description", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.description && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
              </div>
              <div className="flex justify-center items-center">
                {/* price */}
                <div className="mb-4">
                  <label htmlFor="price" className="block text-sm font-medium">
                    Price:
                  </label>
                  <input
                    type="number"
                    {...register("price", { required: true, min: 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.price?.type === "required" && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                  {errors.price?.type === "min" && (
                    <span className="text-red-500 text-sm">
                      Price must be a non-negative value
                    </span>
                  )}
                </div>
                {/* image */}
                <div className="mb-4">
                  <label htmlFor="image" className="block text-sm font-medium">
                    Image URL:
                  </label>
                  <input
                    type="text"
                    {...register("image", { required: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.image && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
              </div>
              {/*  */}
              <div className="flex justify-between items-center">
                {/* category */}
                <div className="mb-4">
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium"
                  >
                    Category:
                  </label>
                  <Select
                    {...register("category", { required: true })}
                    options={categoryOptions}
                    onChange={handleCategoryChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.category && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
                {/* color */}
                <div className="mb-4">
                  <label htmlFor="color" className="block text-sm font-medium">
                    Color:
                  </label>
                  <Select
                    {...register("color", { required: true })}
                    options={colorOptions}
                    onChange={handleColorChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                  {errors.color && (
                    <span className="text-red-500 text-sm">
                      This field is required
                    </span>
                  )}
                </div>
              </div>
              {/* size */}
              <div className="mb-4">
                <label htmlFor="size" className="block text-sm font-medium">
                  Size:
                </label>
                <Select
                  {...register("size", { required: true })}
                  options={sizeOptions}
                  onChange={handleSizeChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.size && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              {/* stock */}
              <div className="mb-4">
                <label htmlFor="stock" className="block text-sm font-medium">
                  Stock:
                </label>
                <input
                  type="number"
                  {...register("stock", { required: true, min: 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.stock?.type === "required" && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
                {errors.stock?.type === "min" && (
                  <span className="text-red-500 text-sm">
                    Stock must be a non-negative value
                  </span>
                )}
              </div>

              {/* brand */}
              <div className="mb-4">
                <label htmlFor="brand" className="block text-sm font-medium">
                  Brand:
                </label>
                <input
                  type="text"
                  {...register("brand", { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.brand && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              {/* submit */}
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow-md"
                >
                  Add Product
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
/* add product components */
