import ProfileCard from "@/components/layout/ProfileCard";
import RightSidebar from "@/components/layout/RightSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import PostCard from "@/components/layout/PostCard";
import UserCard from "@/components/layout/UserCard"; // new — see below
import React, { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { useGetPersonalizedFeedQuery, useSearchFeedQuery } from "@/lib/redux/api/feedApi";
import PostSkeleton from "@/components/layout/PostSkeleton";
import ReportWizard from "@/components/layout/ReportWizard";
import { AlertTriangle, Search, User, Home, Map, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "@/lib/redux/api/authApi";
import MissingPersonModal from "@/components/layout/MissingPersonModal";
import { useDispatch } from "react-redux";
import { openModal } from "@/lib/redux/slices/missingPersonSlice";


export default function Feed({ externalSearchParams, onClearSearch }) {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

  const searchParams = externalSearchParams;
  const setSearchParams = onClearSearch;  // only used to clear
    const [searchPage, setSearchPage] = useState(1);

  const { data: meData } = useGetMeQuery();
  const user = currentUser || meData?.user || null;

  // Normal feed state
  const [cursor, setCursor] = useState(null);
  const [open, setOpen] = useState(false);

  // Search state


  const { data: feedData, isFetching: feedFetching, refetch } = useGetPersonalizedFeedQuery(
    { cursor, limit: 5 },
    { skip: !!searchParams, refetchOnMountOrArgChange: true }
  );

  const { data: searchData, isFetching: searchFetching } = useSearchFeedQuery(
    { ...searchParams, page: searchPage, limit: 10 },
    { skip: !searchParams }
  );

  const posts = feedData?.feed || [];
  const hasMore = feedData?.hasMore || false;

  const fetchMorePosts = () => {
    if (feedData?.nextCursor) setCursor(feedData.nextCursor);
  };

  // Called by Navbar
  // const handleSearch = (params) => {
  //   if (!params) {
  //     setSearchParams(null);
  //     setSearchPage(1);
  //     return;
  //   }
  //   setSearchParams(params);
  //   setSearchPage(1);
  // };

  const handleProfileClick = () => {
    if (user?.username) navigate(`/profile/${user.username}`);
  };

  const isSearching = !!searchParams;
  const searchResults = searchData || {};
  const searchPosts = searchResults.posts || [];
  const searchUsers = searchResults.users || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Pass handleSearch to Navbar via App.jsx — see note below */}
      <div className="flex flex-col lg:flex-row justify-center gap-6 px-4 md:px-6 py-4 max-w-[1440px] mx-auto w-full">

        {/* Left Sidebar */}
        <div className="sticky self-start hidden lg:block w-80 shrink-0 top-18 h-fit">
          <ProfileCard user={user} />
          <Card className="mt-6">
            <CardContent className="p-4">
              <CardTitle className="mb-3 text-sm font-semibold text-gray-700">Navigation</CardTitle>
              <div className="flex flex-col">
                <button onClick={handleProfileClick} className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-left text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600 hover:cursor-pointer">
                  <User className="w-4 h-4" /> Profile
                </button>
                <Link to="/feed" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600">
                  <Home className="w-4 h-4" /> Feed
                </Link>
                <Link to="/heatmap" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600">
                  <Map className="w-4 h-4" /> Heatmap
                </Link>
                <Link to="/missing-persons" className="flex items-center gap-3 px-2 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 hover:text-blue-600">
                  <Users className="w-4 h-4" /> Missing Persons
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle */}
        <div className="flex-1 w-full max-w-2xl">

          {!isSearching && (
            <Card className="mb-6">
              <CardContent className="p-6">
                <CardTitle className="mb-4">Quick Actions</CardTitle>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Button className="py-6 text-lg font-semibold text-white bg-red-600 hover:bg-red-700" onClick={() => setOpen(true)}>
                    <AlertTriangle className="w-5 h-5 mr-2" /> Report a Crime
                  </Button>
                <Button className="py-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700" onClick={() => dispatch(openModal())}>
                    <Search className="w-5 h-5 mr-2" /> Report Missing Person
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <hr className="my-4 border-gray-200" />

          {/* SEARCH RESULTS */}
          {isSearching ? (
            <div className="space-y-6">
              {searchFetching ? (
                [...Array(3)].map((_, i) => <PostSkeleton key={i} />)
              ) : (
                <>
                  {/* User results */}
                  {searchUsers.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-gray-500">
                        Users ({searchResults.userTotal || searchUsers.length})
                      </p>
                      <div className="space-y-3">
                        {searchUsers.map((u) => (
                          <UserCard key={u._id} user={u} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Post results */}
                  {searchPosts.length > 0 && (
                    <div>
                      <p className="mb-3 text-sm font-semibold text-gray-500">
                        Posts ({searchResults.postTotal || searchPosts.length})
                      </p>
                      <div className="space-y-6">
                        {searchPosts.map((post) => {
                          const postData = { ...post };
                          if (postData.anonymous) {
                            postData.user = {
                              name: "Anonymous User",
                              username: "anonymous",
                              profilePicture: "https://res.cloudinary.com/dd7mk4do3/image/upload/v1755870214/aa_pkajlu.jpg",
                            };
                          }
                          return <PostCard key={post._id} post={postData} refetchPosts={() => {}} />;
                        })}
                      </div>
                    </div>
                  )}

                  {searchUsers.length === 0 && searchPosts.length === 0 && (
                    <p className="py-8 text-sm text-center text-gray-500">
                      No results found for "{searchParams?.q}"
                    </p>
                  )}

                  {/* Pagination */}
                  {(searchResults.postTotal > 10 || searchResults.userTotal > 10) && (
                    <div className="flex justify-center gap-3 pt-4">
                      <Button variant="outline" size="sm" disabled={searchPage === 1} onClick={() => setSearchPage(p => p - 1)}>
                        Previous
                      </Button>
                      <span className="self-center text-sm text-gray-500">Page {searchPage}</span>
                      <Button variant="outline" size="sm" onClick={() => setSearchPage(p => p + 1)}>
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            /* NORMAL FEED */
            feedFetching && posts.length === 0 ? (
              <div className="space-y-6">
                {[...Array(3)].map((_, i) => <PostSkeleton key={i} />)}
              </div>
            ) : (
              <InfiniteScroll
                dataLength={posts.length}
                next={fetchMorePosts}
                hasMore={hasMore}
                loader={<div className="space-y-6">{[...Array(2)].map((_, i) => <PostSkeleton key={i} />)}</div>}
                endMessage={<p className="text-center text-gray-500">No more posts to show</p>}
              >
                <div className="space-y-6">
                  {posts.map((post) => {
                    const postData = { ...post };
                    if (postData.anonymous) {
                      postData.user = {
                        name: "Anonymous User",
                        username: "anonymous",
                        profilePicture: "https://res.cloudinary.com/dd7mk4do3/image/upload/v1755870214/aa_pkajlu.jpg",
                      };
                    }
                    return <PostCard key={post._id} post={postData} refetchPosts={refetch} />;
                  })}
                </div>
              </InfiniteScroll>
            )
          )}
        </div>

        {/* Right Sidebar */}
        <div className="sticky self-start hidden xl:block w-80 shrink-0 top-18 h-fit">
          <RightSidebar />
        </div>
      </div>

      <ReportWizard open={open} onOpenChange={setOpen} onPostCreated={refetch} />
      <MissingPersonModal />
    </div>
  );
}