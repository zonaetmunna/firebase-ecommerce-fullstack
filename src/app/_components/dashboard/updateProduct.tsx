"use client";
import { Dialog } from "@headlessui/react";
import { Controller, useForm } from "react-hook-form";
import Select from "react-select";

interface UpdateProductProps {
  product: IProduct | null;
  onClose: () => void;
  onUpdate: (productId: string, updatedProductData: Partial<IProduct>) => void;
}

export default function UpdateProduct({
  product,
  onClose,
  onUpdate,
}: UpdateProductProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<Partial<IProduct>>();

  // Sample options - replace with your actual options
  const categoryOptions = [
    { value: "electronics", label: "Electronics" },
    { value: "clothing", label: "Clothing" },
    { value: "books", label: "Books" },
    { value: "home", label: "Home & Garden" },
  ];

  const colorOptions = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
  ];

  const sizeOptions = [
    { value: "xs", label: "XS" },
    { value: "s", label: "S" },
    { value: "m", label: "M" },
    { value: "l", label: "L" },
    { value: "xl", label: "XL" },
  ];

  const onSubmit = (formData: Partial<IProduct>) => {
    if (product) {
      onUpdate(product.id, formData);
      reset();
    }
  };

  return (
    <Dialog open={!!product} onClose={onClose} className="fixed inset-0 z-10">
      <div className="flex items-center justify-center min-h-screen p-4">
        <Dialog.Overlay className="fixed inset-0 bg-black opacity-50" />

        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <Dialog.Title className="text-lg font-semibold">
            Update Product
          </Dialog.Title>

          {product && (
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* name */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium">
                  Name:
                </label>
                <input
                  type="text"
                  defaultValue={product.name}
                  {...register("name", { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.name && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              {/* price */}
              <div className="mb-4">
                <label htmlFor="price" className="block text-sm font-medium">
                  Price:
                </label>
                <input
                  type="number"
                  defaultValue={product.price}
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
                  defaultValue={product.description}
                  {...register("description", { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    This field is required
                  </span>
                )}
              </div>

              {/* category */}
              <div className="mb-4">
                <label htmlFor="category" className="block text-sm font-medium">
                  Category:
                </label>
                <Controller
                  name="category"
                  control={control}
                  defaultValue={product.category}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={categoryOptions}
                      value={categoryOptions.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value)
                      }
                      className="mt-1"
                    />
                  )}
                />
              </div>

              {/* color */}
              <div className="mb-4">
                <label htmlFor="color" className="block text-sm font-medium">
                  Color:
                </label>
                <Controller
                  name="color"
                  control={control}
                  defaultValue={product.color}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={colorOptions}
                      value={colorOptions.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value)
                      }
                      className="mt-1"
                    />
                  )}
                />
              </div>

              {/* size */}
              <div className="mb-4">
                <label htmlFor="size" className="block text-sm font-medium">
                  Size:
                </label>
                <Controller
                  name="size"
                  control={control}
                  defaultValue={product.size}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={sizeOptions}
                      value={sizeOptions.find(
                        (option) => option.value === field.value
                      )}
                      onChange={(selectedOption) =>
                        field.onChange(selectedOption?.value)
                      }
                      className="mt-1"
                    />
                  )}
                />
              </div>

              {/* stock */}
              <div className="mb-4">
                <label htmlFor="stock" className="block text-sm font-medium">
                  Stock:
                </label>
                <input
                  type="number"
                  defaultValue={product.stock}
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

              {/* image */}
              <div className="mb-4">
                <label htmlFor="image" className="block text-sm font-medium">
                  Image:
                </label>
                <input
                  type="text"
                  defaultValue={product.image}
                  {...register("image", { required: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                />
                {errors.image && (
                  <span className="text-red-500 text-sm">
                    This field is required
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
                  defaultValue={product.brand}
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
              <div className="flex justify-end space-x-4">
                <button
                  type="submit"
                  className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md"
                >
                  Update Product
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Dialog>
  );
}
