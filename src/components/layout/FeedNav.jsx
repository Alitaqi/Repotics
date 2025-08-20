// components/Navbar.jsx
import { Bell, Settings, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between w-full px-6 py-3 bg-white shadow-sm">
      {/* Left - Logo */}
      <div className="text-2xl font-bold text-blue-600">Reportics</div>

      {/* Middle - Search */}
      <div className="flex-1 max-w-lg mx-6">
        <Input type="text" placeholder="Search crimes, people, tags..." />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Settings className="w-5 h-5" />
        </Button>
        <Button variant="destructive" size="sm" className="flex items-center gap-1">
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </nav>
  );
}