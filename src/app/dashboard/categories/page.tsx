"use client";

import {
  createCategory,
  deleteCategory,
  getAllCategories,
  toggleCategoryStatus,
  updateCategory,
} from "@/fetures/category/categorySlice";
import { RootState } from "@/fetures/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiGrid,
  FiPackage,
  FiPlus,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

export default function AdminCategoriesPage() {
  const dispatch = useDispatch();
  const { categories, loading, error } = useSelector(
    (state: RootState) => state.category
  );

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(
    null
  );
  const [formLoading, setFormLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        await dispatch(getAllCategories() as any);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, [dispatch]);

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = "Category name is required";
    if (!formData.description.trim())
      errors.description = "Description is required";
    if (!formData.image.trim()) errors.image = "Image URL is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setFormLoading(true);

    try {
      if (editingCategory) {
        await dispatch(
          updateCategory({ id: editingCategory.id, data: formData }) as any
        ).unwrap();
        toast.success("Category updated successfully!");
      } else {
        await dispatch(createCategory(formData) as any).unwrap();
        toast.success("Category created successfully!");
      }

      setShowModal(false);
      resetForm();

      // Refresh categories list
      dispatch(getAllCategories() as any);
    } catch (error: any) {
      console.error("Category save error:", error);
      toast.error(error?.message || "Failed to save category");
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (category: ICategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name || "",
      description: category.description || "",
      image: category.image || "",
      isActive: category.isActive !== false,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      setActionLoading(categoryId);
      try {
        await dispatch(deleteCategory(categoryId) as any).unwrap();
        toast.success("Category deleted successfully!");

        // Refresh categories list
        dispatch(getAllCategories() as any);
      } catch (error: any) {
        console.error("Category delete error:", error);
        toast.error(error?.message || "Failed to delete category");
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleToggleStatus = async (
    categoryId: string,
    currentStatus: boolean
  ) => {
    setActionLoading(categoryId);
    try {
      await dispatch(
        toggleCategoryStatus({ categoryId, isActive: !currentStatus }) as any
      ).unwrap();
      toast.success(
        `Category ${!currentStatus ? "activated" : "deactivated"} successfully!`
      );
    } catch (error: any) {
      console.error("Category status toggle error:", error);
      toast.error(error?.message || "Failed to update category status");
    } finally {
      setActionLoading(null);
    }
  };

  const resetForm = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      image: "",
      isActive: true,
    });
    setFormErrors({});
  };

  // Calculate stats
  const totalCategories = categories.length;
  const activeCategories = categories.filter((cat) => cat.isActive).length;
  const inactiveCategories = totalCategories - activeCategories;
  const totalProducts = categories.reduce(
    (sum, cat) => sum + (cat.productCount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Categories
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalCategories}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiGrid className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Active Categories
              </p>
              <p className="text-3xl font-bold text-green-600">
                {activeCategories}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiEye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Inactive Categories
              </p>
              <p className="text-3xl font-bold text-red-600">
                {inactiveCategories}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiEyeOff className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Products
              </p>
              <p className="text-3xl font-bold text-purple-600">
                {totalProducts}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiPackage className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">
            Organize your products into categories
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          Error: {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading categories...</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow border border-gray-200"
          >
            {/* Category Image */}
            <div className="relative h-48 bg-gray-100">
              <Image
                src={category.image || "/placeholder.jpg"}
                alt={category.name}
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4">
                <button
                  onClick={() =>
                    handleToggleStatus(category.id, category.isActive)
                  }
                  disabled={actionLoading === category.id}
                  className={`p-2 rounded-full transition-colors ${
                    category.isActive
                      ? "bg-green-100 text-green-600 hover:bg-green-200"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  } ${actionLoading === category.id ? "opacity-50" : ""}`}
                  title={
                    category.isActive
                      ? "Deactivate category"
                      : "Activate category"
                  }
                >
                  {actionLoading === category.id ? (
                    <div className="w-5 h-5 border-t-2 border-current border-solid rounded-full animate-spin"></div>
                  ) : category.isActive ? (
                    <FiEye className="w-5 h-5" />
                  ) : (
                    <FiEyeOff className="w-5 h-5" />
                  )}
                </button>
              </div>
              <div className="absolute top-4 left-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    category.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {category.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* Category Content */}
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {category.name}
                </h3>
                <span className="text-sm text-gray-500">
                  {category.productCount || 0} products
                </span>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {category.description}
              </p>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
                    disabled={actionLoading === category.id}
                    className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete category"
                  >
                    {actionLoading === category.id ? (
                      <div className="w-4 h-4 border-t-2 border-current border-solid rounded-full animate-spin"></div>
                    ) : (
                      <FiTrash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  {category.createdAt && (
                    <>
                      Created{" "}
                      {new Date(category.createdAt).toLocaleDateString()}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {categories.length === 0 && !loading && (
        <div className="text-center py-12">
          <FiGrid className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No categories found
          </h3>
          <p className="text-gray-500 mb-4">
            Get started by creating your first category
          </p>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Category
          </button>
        </div>
      )}

      {/* Add/Edit Category Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter category name"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="Enter category description"
                />
                {formErrors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.description}
                  </p>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image URL *
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.image ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {formErrors.image && (
                  <p className="text-red-500 text-sm mt-1">
                    {formErrors.image}
                  </p>
                )}
              </div>

              {/* Image Preview */}
              {formData.image && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Preview
                  </label>
                  <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Category preview"
                      fill
                      className="object-cover"
                      onError={() => {
                        setFormErrors({
                          ...formErrors,
                          image: "Invalid image URL",
                        });
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label
                  htmlFor="isActive"
                  className="ml-2 text-sm text-gray-700"
                >
                  Active category (visible to customers)
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <>
                      <div className="w-4 h-4 border-t-2 border-white border-solid rounded-full animate-spin mr-2"></div>
                      {editingCategory ? "Updating..." : "Creating..."}
                    </>
                  ) : editingCategory ? (
                    "Update Category"
                  ) : (
                    "Create Category"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
