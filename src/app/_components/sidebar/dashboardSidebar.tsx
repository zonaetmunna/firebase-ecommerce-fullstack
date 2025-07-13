"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FiBarChart,
  FiBell,
  FiDatabase,
  FiDownload,
  FiFolder,
  FiHome,
  FiSearch,
  FiSettings,
  FiShield,
  FiShoppingBag,
  FiShoppingCart,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: <FiHome className="w-5 h-5" />,
  },
  {
    href: "/dashboard/analytics",
    label: "Analytics",
    icon: <FiBarChart className="w-5 h-5" />,
  },
  {
    href: "/dashboard/products",
    label: "Products",
    icon: <FiShoppingBag className="w-5 h-5" />,
  },
  {
    href: "/dashboard/categories",
    label: "Categories",
    icon: <FiFolder className="w-5 h-5" />,
  },
  {
    href: "/dashboard/orders",
    label: "Orders",
    icon: <FiShoppingCart className="w-5 h-5" />,
  },
  {
    href: "/dashboard/users",
    label: "Users",
    icon: <FiUsers className="w-5 h-5" />,
  },
  {
    href: "/dashboard/inventory",
    label: "Inventory",
    icon: <FiTrendingUp className="w-5 h-5" />,
  },
  {
    href: "/dashboard/notifications",
    label: "Notifications",
    icon: <FiBell className="w-5 h-5" />,
  },
  {
    href: "/dashboard/search",
    label: "Global Search",
    icon: <FiSearch className="w-5 h-5" />,
  },
  {
    href: "/dashboard/exports",
    label: "Data Export",
    icon: <FiDownload className="w-5 h-5" />,
  },
  {
    href: "/dashboard/backup",
    label: "Backup",
    icon: <FiDatabase className="w-5 h-5" />,
  },
  {
    href: "/dashboard/audit-logs",
    label: "Audit Logs",
    icon: <FiShield className="w-5 h-5" />,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: <FiSettings className="w-5 h-5" />,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-xl font-bold text-gray-900">Admin Panel</span>
        </Link>
      </div>

      <nav className="mt-6 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <span
                    className={isActive ? "text-blue-600" : "text-gray-400"}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1">System Status</p>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-sm text-gray-600">
              All systems operational
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
