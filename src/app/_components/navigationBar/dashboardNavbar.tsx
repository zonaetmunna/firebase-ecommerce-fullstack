import Link from "next/link";
import { FiUser } from "react-icons/fi";
export default function DashboardNavbar() {
  return (
    <nav className="bg-gray-900 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">
          Dashboard
        </Link>
        <ul className="flex space-x-4">
          <li>
            <Link href="/dashboard/profile">
              <FiUser className="inline-block mr-1" /> Profile
            </Link>
          </li>
          {/* Add more navigation links as needed */}
        </ul>
      </div>
    </nav>
  );
}
