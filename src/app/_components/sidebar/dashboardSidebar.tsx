import Link from "next/link";

export default function DashboardSidebar() {
  return (
    <aside className="bg-gray-800 text-white w-60 p-4">
      <nav>
        <ul className="space-y-4">
          <li>
            <Link
              href="/dashboard/products"
              className="block hover:text-gray-300"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/categories"
              className="block hover:text-gray-300"
            >
              Category
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/orders"
              className="block hover:text-gray-300"
            >
              Orders
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/settings"
              className="block hover:text-gray-300"
            >
              Settings
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
