"use client";

import { getLowStockProducts } from "@/fetures/admin/adminSlice";
import {
  bulkUpdateProducts,
  getAllProducts,
  updateProduct,
} from "@/fetures/product/productSlice";
import { RootState } from "@/fetures/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiAlertTriangle,
  FiCheckSquare,
  FiDownload,
  FiEdit2,
  FiPackage,
  FiRefreshCw,
  FiSave,
  FiSearch,
  FiSquare,
  FiTrendingDown,
  FiTrendingUp,
  FiX,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

interface BulkUpdate {
  id: string;
  field: string;
  value: any;
}

export default function InventoryPage() {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector(
    (state: RootState) => state.product
  );
  const { lowStockProducts } = useSelector((state: RootState) => state.admin);

  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<string>("");
  const [editingStock, setEditingStock] = useState<Record<string, number>>({});
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkUpdates, setBulkUpdates] = useState<BulkUpdate[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getAllProducts({ page: 1, limitCount: 100 }) as any),
          dispatch(getLowStockProducts() as any),
        ]);
      } catch (error) {
        console.error("Error fetching inventory data:", error);
        toast.error("Failed to load inventory data");
      }
    };

    fetchData();
  }, [dispatch]);

  const fetchInventoryData = async () => {
    try {
      await Promise.all([
        dispatch(getAllProducts({ page: 1, limitCount: 100 }) as any),
        dispatch(getLowStockProducts() as any),
      ]);
    } catch (error) {
      console.error("Error fetching inventory data:", error);
      toast.error("Failed to load inventory data");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchInventoryData();
      toast.success("Inventory data refreshed!");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const handleStockEdit = (productId: string, currentStock: number) => {
    setEditingStock({ ...editingStock, [productId]: currentStock });
  };

  const handleStockSave = async (productId: string) => {
    const newStock = editingStock[productId];
    if (newStock < 0) {
      toast.error("Stock cannot be negative");
      return;
    }

    setActionLoading(true);
    try {
      await dispatch(
        updateProduct({
          id: productId,
          data: { stock: newStock },
        }) as any
      ).unwrap();

      toast.success("Stock updated successfully!");

      // Remove from editing state
      const newEditingStock = { ...editingStock };
      delete newEditingStock[productId];
      setEditingStock(newEditingStock);

      // Refresh data
      fetchInventoryData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update stock");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStockCancel = (productId: string) => {
    const newEditingStock = { ...editingStock };
    delete newEditingStock[productId];
    setEditingStock(newEditingStock);
  };

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleBulkStockUpdate = async (adjustment: number) => {
    if (selectedProducts.length === 0) {
      toast.error("Please select products to update");
      return;
    }

    setActionLoading(true);
    try {
      const updates = selectedProducts.map((productId) => {
        const product = products.find((p) => p.id === productId);
        return {
          id: productId,
          data: { stock: Math.max(0, (product?.stock || 0) + adjustment) },
        };
      });

      await dispatch(bulkUpdateProducts(updates) as any).unwrap();
      toast.success(`Updated stock for ${selectedProducts.length} products!`);

      setSelectedProducts([]);
      fetchInventoryData();
    } catch (error: any) {
      toast.error(error?.message || "Failed to update stock");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStockFilter =
      stockFilter === "" ||
      (stockFilter === "low" && (product.stock || 0) <= 10) ||
      (stockFilter === "out" && (product.stock || 0) === 0) ||
      (stockFilter === "in" && (product.stock || 0) > 0);

    return matchesSearch && matchesStockFilter;
  });

  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Out of Stock", color: "bg-red-100 text-red-800" };
    if (stock <= 10)
      return { label: "Low Stock", color: "bg-yellow-100 text-yellow-800" };
    return { label: "In Stock", color: "bg-green-100 text-green-800" };
  };

  // Calculate stats
  const totalProducts = products.length;
  const outOfStock = products.filter((p) => (p.stock || 0) === 0).length;
  const lowStock = products.filter(
    (p) => (p.stock || 0) > 0 && (p.stock || 0) <= 10
  ).length;
  const inStock = products.filter((p) => (p.stock || 0) > 10).length;
  const totalValue = products.reduce(
    (sum, product) => sum + (product.price || 0) * (product.stock || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Products
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {totalProducts}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiPackage className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">In Stock</p>
              <p className="text-3xl font-bold text-green-600">{inStock}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiTrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Low Stock</p>
              <p className="text-3xl font-bold text-yellow-600">{lowStock}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FiAlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Out of Stock</p>
              <p className="text-3xl font-bold text-red-600">{outOfStock}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiTrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-purple-600">
                ${totalValue.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiPackage className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage product stock levels
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <FiDownload className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockProducts && lowStockProducts.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <FiAlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <h3 className="text-lg font-semibold text-yellow-800">
              Low Stock Alerts
            </h3>
          </div>
          <p className="text-yellow-700 mt-1">
            {lowStockProducts.length} products are running low on stock.
            Consider restocking soon.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {lowStockProducts.slice(0, 5).map((item, index) => (
              <span
                key={index}
                className="inline-flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full"
              >
                {item.productName} ({item.currentStock} left)
              </span>
            ))}
            {lowStockProducts.length > 5 && (
              <span className="inline-flex items-center px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-full">
                +{lowStockProducts.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, brand, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Stock Levels</option>
            <option value="in">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="out">Out of Stock</option>
          </select>
        </div>

        {/* Bulk Actions */}
        {selectedProducts.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedProducts.length} products selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStockUpdate(-1)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  -1 Stock
                </button>
                <button
                  onClick={() => handleBulkStockUpdate(-10)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  -10 Stock
                </button>
                <button
                  onClick={() => handleBulkStockUpdate(1)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  +1 Stock
                </button>
                <button
                  onClick={() => handleBulkStockUpdate(10)}
                  disabled={actionLoading}
                  className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
                >
                  +10 Stock
                </button>
                <button
                  onClick={() => setSelectedProducts([])}
                  className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )}
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
          <span className="ml-2 text-gray-600">Loading inventory...</span>
        </div>
      )}

      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center text-gray-500 hover:text-gray-700"
                  >
                    {selectedProducts.length === filteredProducts.length &&
                    filteredProducts.length > 0 ? (
                      <FiCheckSquare className="w-4 h-4" />
                    ) : (
                      <FiSquare className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const isEditing = editingStock.hasOwnProperty(product.id);
                const stockStatus = getStockStatus(product.stock || 0);

                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleProductSelect(product.id)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        {selectedProducts.includes(product.id) ? (
                          <FiCheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <FiSquare className="w-4 h-4" />
                        )}
                      </button>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <Image
                            src={product.image || "/placeholder.jpg"}
                            alt={product.name}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {product.brand}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.category}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price?.toFixed(2)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {isEditing ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            min="0"
                            value={editingStock[product.id]}
                            onChange={(e) =>
                              setEditingStock({
                                ...editingStock,
                                [product.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleStockSave(product.id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-800 disabled:opacity-50"
                          >
                            <FiSave className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStockCancel(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiX className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {product.stock || 0}
                          </span>
                          <button
                            onClick={() =>
                              handleStockEdit(product.id, product.stock || 0)
                            }
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <FiEdit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      $
                      {((product.price || 0) * (product.stock || 0)).toFixed(2)}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            handleStockEdit(product.id, product.stock || 0)
                          }
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit stock"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && !loading && (
          <div className="text-center py-8">
            <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
