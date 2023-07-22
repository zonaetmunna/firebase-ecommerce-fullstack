"use client";
import { RootState } from "@/fetures/store";
import { logoutUser } from "@/fetures/user/userSlice";
import Link from "next/link";
import { useState } from "react";
import { FaBars, FaHeart, FaSearch, FaShoppingCart } from "react-icons/fa";
import { VscAccount } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";

interface NavbarProps {
  onCartClick: () => void;
}
export default function Navbar({ onCartClick }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLinks, setShowLinks] = useState(false);

  // user from redux
  const { currentUser } = useSelector((state: RootState) => state.auth);
  const { cart } = useSelector((state: RootState) => state.cart);
  const { wishlist } = useSelector((state: RootState) => state.wishlist);
  const dispatch = useDispatch();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleButtonClick = () => {
    setShowLinks(!showLinks); // Toggle the visibility of links
  };

  const handleLogOut = () => {
    dispatch(logoutUser());
  };

  return (
    <nav className="flex flex-col md:flex-row items-center justify-between p-4 bg-gray-100 text-black">
      <div className="flex items-center space-x-4">
        <Link href="/" className="flex items-center ml-2 text-lg font-semibold">
          {/* <img src="/logo.png" alt="Logo" className="w-10 h-10" /> */}
          My app
        </Link>
        <div className="md:hidden flex items-center">
          <button className="p-2 rounded-md bg-gray-200" onClick={toggleMenu}>
            <FaBars className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* input  */}
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search"
            className="pl-10 pr-4 py-2 rounded-md bg-gray-200 focus:bg-white focus:outline-none"
          />
          <FaSearch className="absolute left-3 top-2 text-gray-500" />
        </div>
      </div>

      <div className="flex items-center md:space-x-4">
        <div className="flex items-center space-x-4">
          <div onClick={onCartClick} className="mx-2">
            <div className="relative">
              <FaShoppingCart size={20} className="text-yellow-500" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 text-xs text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </div>
          <Link href="/wishlist" className="mx-2">
            <div className="relative">
              <FaHeart size={20} className="text-yellow-500" />
              {wishlist.length > 0 && (
                <span className="absolute -top-1 -right-1 text-xs text-white bg-red-500 rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </div>
          </Link>

          {!currentUser?.email && (
            <Link href="/login" className="mx-2">
              Login
            </Link>
          )}

          {currentUser?.role === "admin" && (
            <Link href="/dashboard" className="mx-2">
              Admin Dashboard
            </Link>
          )}

          {user?.role === "user" && (
            <div className="">
              <button
                onClick={handleButtonClick}
                className="mx-2 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
              >
                <VscAccount size={20} />
                {showLinks && (
                  <div className="absolute z-10 mt-2 w-48 bg-white rounded-md shadow-lg">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Profile
                    </Link>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                      Settings
                    </Link>
                    <button
                      className="block px-4 py-2 text-gray-600 hover:text-gray-800"
                      onClick={handleLogOut}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden mt-2 flex flex-col space-y-2">
          <a href="#" className="text-white">
            Link 1
          </a>
          <a href="#" className="text-white">
            Link 2
          </a>
          <a href="#" className="text-white">
            Link 3
          </a>
        </div>
      )}
    </nav>
  );
}
