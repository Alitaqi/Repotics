// pages/Feed.jsx
import ProfileCard from "@/components/layout/ProfileCard";
import RightSidebar from "@/components/layout/RightSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import PostCard from "@/components/layout/PostCard";
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGetPersonalizedFeedQuery } from "@/lib/redux/api/feedApi";
import PostSkeleton from "@/components/layout/PostSkeleton";
import ReportWizard from "@/components/layout/ReportWizard";
import { AlertTriangle, Search, User, Home, Map, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/lib/redux/api/authApi"; // ✅ ensure this import exists

export default function Feed() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);

  // ✅ Fetch logged-in user (fallback to API if not in Redux)
  const { data: meData } = useGetMeQuery(undefined, { skip: !!currentUser });
  const user = currentUser || meData?.user || null;

  const [cursor, setCursor] = useState(null);
  const [open, setOpen] = useState(false);
  const { data, isFetching, refetch } = useGetPersonalizedFeedQuery(
    { cursor, limit: 5 },
    { refetchOnMountOrArgChange: true }
  );

  const posts = data?.feed || [];
  const hasMore = data?.hasMore || false;

  const fetchMorePosts = () => {
    if (data?.nextCursor) setCursor(data.nextCursor);
  };

  const handleProfileClick = () => {
    if (user?.username) navigate(`/profile/${user.username}`);
  };
  console.log("Feed posts data:", posts); //del me

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col lg:flex-row justify-center gap-6 px-4 md:px-6 py-4 max-w-[1440px] mx-auto w-full">
        {/* Left Sidebar */}
        <div className="sticky self-start hidden lg:block w-80 shrink-0 top-18 h-fit">
          <ProfileCard />

          {/* Navigation Box */}
          <Card className="mt-6">
            <CardContent className="p-4">
              <CardTitle className="mb-3 text-sm font-semibold text-gray-700">
                Navigation
              </CardTitle>
              <div className="flex flex-col">
                {/* ✅ Dynamic Profile Link */}
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-left text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 hover:cursor-pointer"
                >
                  <User className="w-4 h-4" /> Profile
                </button>

                <Link
                  to="/feed"
                  className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
                >
                  <Home className="w-4 h-4" /> Feed
                </Link>

                <Link
                  to="/heatmap"
                  className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
                >
                  <Map className="w-4 h-4" /> Heatmap
                </Link>

                <Link
                  to="/missing-persons"
                  className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600"
                >
                  <Users className="w-4 h-4" /> Missing Persons
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Feed */}
        <div className="flex-1 w-full max-w-2xl">
          {/* Quick Actions */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <CardTitle className="mb-4">Quick Actions</CardTitle>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Button
                  className="py-6 text-lg font-semibold text-white bg-red-600 hover:bg-red-700"
                  onClick={() => setOpen(true)}
                >
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Report a Crime
                </Button>
                <Button className="py-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">
                  <Search className="w-5 h-5 mr-2" />
                  Report Missing Person
                </Button>
              </div>
            </CardContent>
          </Card>

          <hr className="my-4 border-gray-200" />

          {/* Posts */}
          {isFetching && posts.length === 0 ? (
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <PostSkeleton key={i} />
              ))}
            </div>
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={fetchMorePosts}
              hasMore={hasMore}
              loader={
                <div className="space-y-6">
                  {[...Array(2)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              }
              endMessage={
                <p className="text-center text-gray-500">
                  No more posts to show
                </p>
              }
            >
              <div className="space-y-6">
                {posts.map((post) => {
                  // ✅ Create a safe copy of post data
                  const postData = { ...post };

                  // ✅ If the post is anonymous, replace user info
                  if (postData.anonymous) {
                    postData.user = {
                      name: "Anonymous User",
                      username: "anonymous",
                      profilePicture: "https://res.cloudinary.com/dd7mk4do3/image/upload/v1755870214/aa_pkajlu.jpg", // you can place a default image in your public folder
                    };
                  }

                  return <PostCard key={post._id} post={postData} refetchPosts={refetch} />;
                })}
              </div>
            </InfiniteScroll>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="sticky self-start hidden xl:block w-80 shrink-0 top-18 h-fit">
          <RightSidebar />
        </div>
      </div>

      {/* Report Wizard */}
      <ReportWizard open={open} onOpenChange={setOpen} onPostCreated={refetch} />
    </div>
  );
}
