"use client";

import {
  getDashboardAnalytics,
  getDashboardStats,
  getLowStockProducts,
  getRecentActivities,
} from "@/fetures/admin/adminSlice";
import { RootState } from "@/fetures/store";
import Image from "next/image";
import { useEffect } from "react";
import {
  FiActivity,
  FiAlertTriangle,
  FiDollarSign,
  FiShoppingBag,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const {
    analytics,
    dashboardStats,
    lowStockProducts,
    notifications,
    loading,
  } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          dispatch(getDashboardAnalytics() as any),
          dispatch(getDashboardStats() as any),
          dispatch(getLowStockProducts() as any),
          dispatch(getRecentActivities() as any),
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${analytics.totalRevenue.toLocaleString()}`,
      change: dashboardStats?.revenueGrowth || 0,
      icon: <FiDollarSign className="w-6 h-6" />,
      color: "text-green-600 bg-green-100",
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders.toLocaleString(),
      change: dashboardStats?.ordersGrowth || 0,
      icon: <FiShoppingCart className="w-6 h-6" />,
      color: "text-blue-600 bg-blue-100",
    },
    {
      title: "Total Products",
      value: analytics.totalProducts.toLocaleString(),
      change: dashboardStats?.productsGrowth || 0,
      icon: <FiShoppingBag className="w-6 h-6" />,
      color: "text-purple-600 bg-purple-100",
    },
    {
      title: "Total Users",
      value: analytics.totalUsers.toLocaleString(),
      change: dashboardStats?.usersGrowth || 0,
      icon: <FiUsers className="w-6 h-6" />,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back! Here&apos;s what&apos;s happening with your store.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <FiActivity className="w-4 h-4" />
          <span>Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-lg shadow-sm border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {card.value}
                </p>
                <div className="flex items-center mt-2">
                  <span
                    className={`text-sm font-medium ${
                      card.change >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {card.change >= 0 ? "+" : ""}
                    {card.change.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">
                    from last month
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Orders
          </h3>
          <div className="space-y-4">
            {analytics.recentOrders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Order #{order.id.slice(-8)}
                  </p>
                  <p className="text-sm text-gray-600">{order.userEmail}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    ${order.totalAmount}
                  </p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      order.orderStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : order.orderStatus === "shipped"
                        ? "bg-blue-100 text-blue-800"
                        : order.orderStatus === "processing"
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
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Products
          </h3>
          <div className="space-y-4">
            {analytics.topProducts.slice(0, 5).map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Stock: {product.stock}
                  </p>
                </div>
                <span className="font-semibold text-gray-900">
                  ${product.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Low Stock Alert
            </h3>
            <FiAlertTriangle className="w-5 h-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            {lowStockProducts.slice(0, 5).map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between py-2"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {item.productName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock: {item.currentStock}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    item.status === "out_of_stock"
                      ? "bg-red-100 text-red-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {item.status === "out_of_stock"
                    ? "Out of Stock"
                    : "Low Stock"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h3>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div
                  className={`p-1 rounded-full ${
                    activity.type === "order"
                      ? "bg-blue-100"
                      : activity.type === "user"
                      ? "bg-green-100"
                      : activity.type === "product"
                      ? "bg-purple-100"
                      : "bg-gray-100"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-current"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {activity.title}
                  </p>
                  <p className="text-sm text-gray-600">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {activity.createdAt && activity.createdAt.toDate
                      ? activity.createdAt.toDate().toLocaleString()
                      : "Just now"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Sales Chart Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Sales Overview
        </h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <FiTrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Sales chart would be displayed here</p>
            <p className="text-sm text-gray-400">
              Integration with chart library needed
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
