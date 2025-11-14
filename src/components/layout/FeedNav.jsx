// components/Navbar.jsx
import { Bell, Settings, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Logo from "@/assets/Logo.svg";
import { useDispatch } from "react-redux";
import { useLogoutUserMutation } from "@/lib/redux/api/authApi";
import { logout } from "@/lib/redux/slices/authSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState } from "react";
import {Home, Map, Users, User } from "lucide-react";
import { useSelector } from "react-redux";


export default function Navbar() {
  const currentUser = useSelector((state) => state.auth.user);
  const [logoutApi] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
      dispatch(logout());
      navigate("/auth");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const toggleNotifications = () => setShowNotifications(!showNotifications);

  const isFeedPage = location.pathname === "/feed";

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-4 py-3 bg-white shadow-sm md:px-6">
      {/* Left - Logo */}
      <div className="flex items-center">
        <Link to="/feed">
          <img
            src={Logo}
            alt="Logo"
            className="object-cover w-10 h-10 rounded-full cursor-pointer"
          />
        </Link>
      </div>

     {/* Middle - Search or Nav Links (hidden on mobile) */}
      <div className="justify-center flex-1 hidden md:flex">
        {isFeedPage ? (
          <div className="w-full max-w-lg">
            <Input type="text" placeholder="Search crimes, people, tags..." />
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <Link to="/feed" className="flex items-center gap-2 text-sm font-medium hover:text-gray-700">
              <Home className="w-4 h-4" /> Feed
            </Link>
            <Link to="/heatmap" className="flex items-center gap-2 text-sm font-medium hover:text-gray-700">
              <Map className="w-4 h-4" /> Heatmap
            </Link>
            <Link to="/missing-persons" className="flex items-center gap-2 text-sm font-medium hover:text-gray-700">
              <Users className="w-4 h-4" /> Missing Persons
            </Link>
          </div>
        )}
      </div>

      {/* Right - Actions (desktop only) */}
      <div className="items-center hidden gap-3 md:flex">
        <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
          <LayoutDashboard className="w-5 h-5" />
        </Button>

        {/* Notifications */}
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={toggleNotifications}>
            <Bell className="w-5 h-5" />
          </Button>
          {showNotifications && (
            <div className="absolute right-0 z-50 w-64 p-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <p className="mb-2 text-sm font-medium">Notifications</p>
              <div className="overflow-y-auto divide-y divide-gray-200 max-h-64">
                <p className="py-1 text-xs">User A commented on your post</p>
                <p className="py-1 text-xs">User B liked your post</p>
                <p className="py-1 text-xs">User C started following you</p>
              </div>
            </div>
          )}
        </div>

        <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
          <Settings className="w-5 h-5" />
        </Button>

        <Button variant="destructive" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </Button>
      </div>

      {/* Hamburger (mobile only) */}
      <div className="flex md:hidden">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 z-40 w-full px-4 py-4 bg-white shadow-md top-16 md:hidden">
          {/* Show search only on feed */}
          {isFeedPage && (
            <div className="mb-4">
              <Input type="text" placeholder="Search crimes, people, tags..." />
            </div>
          )}

          {/* Navigation Links */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/profile/${currentUser.username}`}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <User className="w-4 h-4" /> Profile
            </Link>

            <Link
              to="/feed"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <Home className="w-4 h-4" /> Feed
            </Link>

            <Link
              to="/heatmap"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <Map className="w-4 h-4" /> Heatmap
            </Link>

            <Link
              to="/missing-persons"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <Users className="w-4 h-4" /> Missing Persons
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>

            <Link
              to="/settings"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100"
            >
              <Settings className="w-4 h-4" /> Settings
            </Link>

            <button
              onClick={() => {
                toggleNotifications();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-left rounded-md hover:bg-gray-100"
            >
              <Bell className="w-4 h-4" /> Notifications
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 mt-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}

    </nav>
  );
}
