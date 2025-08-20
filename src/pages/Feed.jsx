// pages/Feed.jsx
import ProfileCard from "@/components/layout/ProfileCard";
import RightSidebar from "@/components/layout/RightSidebar";
import { Button } from "@/components/ui/button";
import PostCard from "@/components/layout/PostCard";

export default function Feed() {
  return (
    <div className="flex flex-col h-screen">
    

      {/* Main Content */}
      <div className="flex flex-1 gap-6 px-6 py-4">
        {/* Left - Profile Sidebar */}
        <div className="w-80">
          <ProfileCard />
        </div>

        {/* Middle - Feed Section */}
        <div className="flex-1 max-w-2xl">
          {/* Action Buttons */}
          <div className="flex gap-3 mb-4">
            <Button className="bg-red-600 hover:bg-red-700">
              Report Crime
            </Button>
            <Button className="text-black bg-yellow-500 hover:bg-yellow-600">
              Report Missing Person
            </Button>
          </div>

          {/* Divider */}
          <hr className="my-4 border-gray-200" />

          {/* Feed Posts */}
          <div className="space-y-6">
            <PostCard />
            <PostCard />
            <PostCard />
          </div>A
        </div>

        {/* Right - Trending & Safety Tips */}
        <RightSidebar />
      </div>
    </div>
  );
}
