import { Bell, Settings, LogOut, LayoutDashboard, Menu, X, Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Logo from "@/assets/Logo.svg";
import { useDispatch } from "react-redux";
import { useLogoutUserMutation } from "@/lib/redux/api/authApi";
import { logout } from "@/lib/redux/slices/authSlice";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { Home, Map, Users, User } from "lucide-react";
import { useSelector } from "react-redux";
import { useGetNotificationsQuery, useMarkAsReadMutation, useMarkAllAsReadMutation } from "@/lib/redux/api/profileApi";

export default function Navbar({ onSearch }) {
  const currentUser = useSelector((state) => state.auth.user);
  const [logoutApi] = useLogoutUserMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [includePosts, setIncludePosts] = useState(true);
  const [includeUsers, setIncludeUsers] = useState(true);

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

  const handleSearch = () => {
    if (!query.trim()) return;
    if (onSearch) onSearch({ q: query, includePosts, includeUsers });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) onSearch(null); // null = clear search, go back to normal feed
  };

  const { data: notifications = [] } = useGetNotificationsQuery(undefined, {
    pollingInterval: 5000, // every 5 sec
  });

  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  return (
    <nav className="sticky top-0 z-50 w-full bg-white shadow-sm">
      <div className="flex items-center justify-between w-full px-4 py-3 md:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/feed">
            <img src={Logo} alt="Logo" className="object-cover w-10 h-10 rounded-full cursor-pointer" />
          </Link>
        </div>

        {/* Middle */}
        <div className="justify-center flex-1 hidden mx-6 md:flex">
          {isFeedPage ? (
            <div className="flex items-center w-full max-w-lg gap-2">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search crimes, people, tags..."
                  className="pr-8 pl-9"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {query && (
                  <button
                    onClick={handleClear}
                    className="absolute -translate-y-1/2 right-3 top-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Search button */}
              <Button onClick={handleSearch} size="sm" className="shrink-0">
                Search
              </Button>

              {/* Filter toggle */}
              <Button
                variant={showFilters ? "default" : "outline"}
                size="icon"
                className="shrink-0"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="size-4" />
              </Button>
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

        {/* Right */}
        <div className="items-center hidden gap-3 md:flex">
          {currentUser?.verified  && (
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <LayoutDashboard className="w-5 h-5" />
          </Button>
          )} 
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={toggleNotifications}>
              <Bell className="w-5 h-5" />
            </Button>
            {notifications.some(n => !n.isRead) && (
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full" />
            )}
            {showNotifications && (
              <div className="absolute right-0 z-50 p-2 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-74">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium">Notifications</p>
                  {notifications.some(n => !n.isRead) && (
                    <button
                      onClick={async () => {
                        await markAllAsRead();
                      }}
                      className="text-[11px] text-blue-600 hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="overflow-y-auto divide-y divide-gray-200 max-h-74 ">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-gray-400">No notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        onClick={() => markAsRead(n._id)}
                        className={`
                          flex gap-4 p-3 mt-1 rounded-lg cursor-pointer transition
                          hover:bg-gray-50
                          ${n.isRead ? "opacity-60" : "bg-blue-50 border-l-2 border-blue-500"}
                        `}
                      >
                        {/* unread dot */}
                        {!n.isRead && (
                          <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full shrink-0" />
                        )}

                        <div className="flex-1">
                          <p className="text-sm leading-snug text-gray-800">
                            {n.message}
                          </p>

                          <p className="mt-1 text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
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

        {/* Hamburger */}
        <div className="flex md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* Filter Panel — slides under navbar on feed page */}
      {isFeedPage && showFilters && (
        <div className="px-4 py-3 border-t bg-gray-50 md:px-6">
          <div className="flex flex-wrap items-center max-w-lg gap-6">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">Filter by:</p>
            <div className="flex items-center gap-2">
              <Switch
                id="include-posts"
                checked={includePosts}
                onCheckedChange={setIncludePosts}
              />
              <Label htmlFor="include-posts" className="text-sm cursor-pointer">Include Posts</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="include-users"
                checked={includeUsers}
                onCheckedChange={setIncludeUsers}
              />
              <Label htmlFor="include-users" className="text-sm cursor-pointer">Include Users</Label>
            </div>
            {query && (
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={handleClear}>
                Clear search
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute left-0 z-40 w-full px-4 py-4 bg-white shadow-md top-16 md:hidden">
          {isFeedPage && (
            <div className="mb-4 space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute -translate-y-1/2 left-3 top-1/2 size-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search..."
                    className="pl-9"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button onClick={handleSearch} size="sm">Search</Button>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <Switch id="m-posts" checked={includePosts} onCheckedChange={setIncludePosts} />
                  <Label htmlFor="m-posts" className="text-sm">Posts</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="m-users" checked={includeUsers} onCheckedChange={setIncludeUsers} />
                  <Label htmlFor="m-users" className="text-sm">Users</Label>
                </div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <Link to={`/profile/${currentUser?.username}`} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              <User className="w-4 h-4" /> Profile
            </Link>
            <Link to="/feed" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              <Home className="w-4 h-4" /> Feed
            </Link>
            <Link to="/heatmap" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              <Map className="w-4 h-4" /> Heatmap
            </Link>
            <Link to="/missing-persons" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              <Users className="w-4 h-4" /> Missing Persons
            </Link>
            {currentUser?.verified  && (
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link> )}
            <Link to="/settings" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-gray-100">
              <Settings className="w-4 h-4" /> Settings
            </Link>
            <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 mt-2 font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}