"use client";

import {
  getDashboardAnalytics,
  getDashboardStats,
  getLowStockProducts,
} from "@/fetures/admin/adminSlice";
import { RootState } from "@/fetures/store";
import Image from "next/image";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  FiActivity,
  FiArrowDown,
  FiArrowUp,
  FiBarChart,
  FiDollarSign,
  FiPackage,
  FiPieChart,
  FiRefreshCw,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { analytics, dashboardStats, lowStockProducts, loading, error } =
    useSelector((state: RootState) => state.admin);

  const [timeRange, setTimeRange] = useState("30days");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          dispatch(getDashboardAnalytics() as any),
          dispatch(getDashboardStats() as any),
          dispatch(getLowStockProducts() as any),
        ]);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast.error("Failed to load analytics data");
      }
    };

    fetchData();
  }, [dispatch]);

  const fetchAnalyticsData = async () => {
    try {
      await Promise.all([
        dispatch(getDashboardAnalytics() as any),
        dispatch(getDashboardStats() as any),
        dispatch(getLowStockProducts() as any),
      ]);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchAnalyticsData();
      toast.success("Analytics data refreshed!");
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? "+" : "";
    return `${sign}${value.toFixed(1)}%`;
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) {
      return <FiArrowUp className="w-4 h-4 text-green-500" />;
    } else if (growth < 0) {
      return <FiArrowDown className="w-4 h-4 text-red-500" />;
    }
    return <FiActivity className="w-4 h-4 text-gray-500" />;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return "text-green-600";
    if (growth < 0) return "text-red-600";
    return "text-gray-600";
  };

  const statCards = [
    {
      title: "Total Revenue",
      value: formatCurrency(analytics?.totalRevenue || 0),
      growth: dashboardStats?.revenueGrowth || 0,
      icon: <FiDollarSign className="w-6 h-6" />,
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Orders",
      value: (analytics?.totalOrders || 0).toLocaleString(),
      growth: dashboardStats?.ordersGrowth || 0,
      icon: <FiShoppingCart className="w-6 h-6" />,
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Products",
      value: (analytics?.totalProducts || 0).toLocaleString(),
      growth: dashboardStats?.productsGrowth || 0,
      icon: <FiPackage className="w-6 h-6" />,
      bgColor: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Total Users",
      value: (analytics?.totalUsers || 0).toLocaleString(),
      growth: dashboardStats?.usersGrowth || 0,
      icon: <FiUsers className="w-6 h-6" />,
      bgColor: "bg-orange-100",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your business performance and insights
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7days">Last 7 days</option>
            <option value="30days">Last 30 days</option>
            <option value="90days">Last 90 days</option>
            <option value="1year">Last year</option>
          </select>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <FiRefreshCw
              className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
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
          <span className="ml-2 text-gray-600">Loading analytics...</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2">
                  {getGrowthIcon(stat.growth)}
                  <span
                    className={`text-sm font-medium ml-1 ${getGrowthColor(
                      stat.growth
                    )}`}
                  >
                    {formatPercentage(stat.growth)}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    vs last period
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <div className={stat.iconColor}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Sales Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Sales
            </h3>
            <FiBarChart className="w-5 h-5 text-gray-400" />
          </div>

          {analytics?.monthlySales && analytics.monthlySales.length > 0 ? (
            <div className="space-y-4">
              {analytics.monthlySales.slice(0, 6).map((month, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                    <span className="text-sm font-medium text-gray-900">
                      {month.month}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(month.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {month.sales} orders
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiBarChart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No sales data available</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Products
            </h3>
            <FiTrendingUp className="w-5 h-5 text-gray-400" />
          </div>

          {analytics?.topProducts && analytics.topProducts.length > 0 ? (
            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.id} className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-semibold text-gray-600">
                      #{index + 1}
                    </span>
                  </div>
                  <div className="flex-shrink-0 w-10 h-10 ml-3">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  </div>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rating: {product.rating}/5
                    </p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    {formatCurrency(product.price)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiPackage className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No product data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h3>
            <FiShoppingCart className="w-5 h-5 text-gray-400" />
          </div>

          {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
            <div className="space-y-4">
              {analytics.recentOrders.slice(0, 5).map((order, index) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Order #{order.id.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">{order.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.orderStatus === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.orderStatus === "processing"
                          ? "bg-blue-100 text-blue-800"
                          : order.orderStatus === "shipped"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No recent orders</p>
            </div>
          )}
        </div>

        {/* Low Stock Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h3>
            <FiActivity className="w-5 h-5 text-red-500" />
          </div>

          {lowStockProducts && lowStockProducts.length > 0 ? (
            <div className="space-y-4">
              {lowStockProducts.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-red-500">
                      Only {item.currentStock} left
                    </p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.status === "out_of_stock"
                        ? "bg-red-100 text-red-800"
                        : item.status === "low_stock"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {item.status.replace("_", " ")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiActivity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">All products are well stocked</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">
          Performance Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              {formatCurrency(
                (analytics?.totalRevenue || 0) /
                  Math.max(analytics?.totalOrders || 1, 1)
              )}
            </h4>
            <p className="text-sm text-gray-500">Average Order Value</p>
          </div>

          <div className="text-center">
            <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiTrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              {(
                (analytics?.totalOrders || 0) /
                Math.max(analytics?.totalUsers || 1, 1)
              ).toFixed(1)}
            </h4>
            <p className="text-sm text-gray-500">Orders per Customer</p>
          </div>

          <div className="text-center">
            <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiPieChart className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">
              {(
                (analytics?.totalRevenue || 0) /
                Math.max(analytics?.totalUsers || 1, 1)
              ).toFixed(0)}
            </h4>
            <p className="text-sm text-gray-500">Revenue per Customer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
