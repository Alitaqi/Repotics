// pages/Profile.jsx
import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Camera, Check, X, BadgeCheck, AlertTriangle, Search, Loader2 } from "lucide-react";
import Post from "@/components/layout/PostCard";
import MissingPersonModal from "@/components/layout/MissingPersonModal";
import { openModal } from "@/lib/redux/slices/missingPersonSlice";
import ReportWizard from "@/components/layout/ReportWizard";
import { 
  setProfile, 
  setBio, 
  replaceBannerImage, 
  replaceProfileImage, 
  unfollow, 
  setFollowStatus, 
  incrementFollowerCount, 
  decrementFollowerCount 
} from "@/lib/redux/slices/profileSlice";
import { 
  useGetProfileQuery, 
  useCheckFollowStatusQuery, 
  useFollowUserMutation, 
  useUnfollowUserMutation,
  useUnfollowOtherUserMutation,
  useUpdateProfilePictureMutation,
  useUpdateBannerPictureMutation,
  useUpdateBioMutation
} from "@/lib/redux/api/profileApi.js";
import {
  useGetMeQuery
} from "@/lib/redux/api/authApi.js";
import { useGetUserPostsQuery } from "@/lib/redux/api/reportApi";

export default function Profile() {
  const dispatch = useDispatch();
  const { username } = useParams();
  
  // ✅ Get current logged-in user from Redux
  const currentUser = useSelector((state) => state.auth.user);

  // ✅ (Optional) Keep it fresh by refetching from API
  const { data: meData } = useGetMeQuery(undefined, { skip: !!currentUser });
  const effectiveUser = currentUser || meData?.user || null;
  
  console.log("Logged-in user:", effectiveUser);
  
  // Get profile data from Redux store
  const user = useSelector((s) => s.profile.user);
  const bannerImage = useSelector((s) => s.profile.images.bannerImage);
  const profileImage = useSelector((s) => s.profile.images.profileImage);
  
  // Check if current user is the profile owner
  const isOwner = user?.isOwner || (currentUser && currentUser.username === username);

  // Fetch profile data from API
  const { data: profileData, isLoading, error, refetch: refetchProfile } = useGetProfileQuery(username);
  // const { data: postsData, isLoading: postsLoading } = useGetUserPostsQuery(username);
  const { data: postsData, isLoading: postsLoading, refetch: refetchPosts } = useGetUserPostsQuery(username);

  
  // Follow status query (skip if current user is owner or not logged in)
  const { data: followStatusData } = useCheckFollowStatusQuery(username, {
    skip: !currentUser || isOwner,
  });
  
  // Mutation hooks for profile updates
  const [followUser, { isLoading: isFollowing }] = useFollowUserMutation();
  const [unfollowUser, { isLoading: isUnfollowing }] = useUnfollowUserMutation();
  const [unfollowOtherUser] = useUnfollowOtherUserMutation();
  const [updateProfilePicture, { isLoading: isUpdatingProfilePic }] = useUpdateProfilePictureMutation();
  const [updateBannerPicture, { isLoading: isUpdatingBanner }] = useUpdateBannerPictureMutation();
  const [updateBio, { isLoading: isUpdatingBio }] = useUpdateBioMutation();

  // Combine Redux + API follow status
  const isFollowingUser = user?.isFollowing ?? followStatusData?.isFollowing ?? false;
  
  // Update Redux store when API data is fetched
  useEffect(() => {
    if (profileData) {
      dispatch(setProfile(profileData));
    }
  }, [profileData, dispatch]);

  // Local UI state
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [open, setOpen] = useState(false);
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const BIO_MAX_LENGTH = 150;

  // Update bio input when user data changes
  useEffect(() => {
    setBioInput(user?.bio || "");
  }, [user?.bio]);

  const handleReportMissingPerson = () => {
    dispatch(openModal());
  };

  
  // 🔹 Handle Banner Image Upload with API Integration
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('bannerPicture', file);

      // Optimistic UI update
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatch(replaceBannerImage(event.target.result));
      };
      reader.readAsDataURL(file);

      // API call
      const result = await updateBannerPicture(formData).unwrap();
      
      // Update with actual Cloudinary URL from backend
      if (result.user?.bannerPicture) {
        dispatch(replaceBannerImage(result.user.bannerPicture));
      }
      
      // Refetch profile to ensure data consistency
      refetchProfile();
      
    } catch (error) {
      console.error('Failed to update banner picture:', error);
      alert('Failed to update banner picture. Please try again.');
      // Revert optimistic update by refetching original data
      refetchProfile();
    }
  };

  // 🔹 Handle Profile Picture Upload with API Integration
  const handleProfileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      // Optimistic UI update
      const reader = new FileReader();
      reader.onload = (event) => {
        dispatch(replaceProfileImage(event.target.result));
      };
      reader.readAsDataURL(file);

      // API call
      const result = await updateProfilePicture(formData).unwrap();
      
      // Update with actual Cloudinary URL from backend
      if (result.user?.profilePicture) {
        dispatch(replaceProfileImage(result.user.profilePicture));
      }
      
      // Refetch profile to ensure data consistency
      refetchProfile();
      
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      alert('Failed to update profile picture. Please try again.');
      // Revert optimistic update by refetching original data
      refetchProfile();
    }
  };

  const triggerBannerInput = () => bannerInputRef.current?.click();
  const triggerProfileInput = () => profileInputRef.current?.click();

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= BIO_MAX_LENGTH) setBioInput(value);
  };

  // 🔹 Save Bio with API Integration
  const saveBio = async () => {
    if (bioInput === user?.bio) {
      setIsEditingBio(false);
      return;
    }

    try {
      // Optimistic UI update
      dispatch(setBio(bioInput));
      
      // API call
      await updateBio(bioInput).unwrap();
      
      setIsEditingBio(false);
      
      // Refetch profile to ensure data consistency
      refetchProfile();
      
    } catch (error) {
      console.error('Failed to update bio:', error);
      alert('Failed to update bio. Please try again.');
      // Revert optimistic update
      setBioInput(user?.bio || "");
      refetchProfile();
    }
  };

  const handleFollow = async () => {
    if (!currentUser) {
      // Optional: Redirect to login or show message
      return;
    }
    
    try {
      await followUser(username).unwrap();
      dispatch(setFollowStatus(true));
      dispatch(incrementFollowerCount());
    } catch (error) {
      console.error('Failed to follow user:', error);
    }
  };

  // For VISITOR unfollowing PROFILE OWNER (with confirmation)
  const handleUnfollowClick = () => {
    setShowUnfollowConfirm(true);
  };

  const confirmUnfollow = async () => {
    try {
      await unfollowUser(username).unwrap();
      dispatch(setFollowStatus(false));
      dispatch(decrementFollowerCount());
      setShowUnfollowConfirm(false);
    } catch (error) {
      console.error('Failed to unfollow user:', error);
    }
  };

  // For PROFILE OWNER unfollowing someone from THEIR following list
  const handleUnfollow = async (username) => {
    try {
      // Find the user to get their username
      const userToUnfollow = user.following.find(u => u.username === username);
      if (!userToUnfollow) {
        console.error('User not found in following list');
        return;
      }
      
      // First update UI optimistically using the _id
      dispatch(unfollow(userToUnfollow._id));
      
      // Then update backend using username
      await unfollowOtherUser(username).unwrap();
      
    } catch (error) {
      console.error('Failed to unfollow:', error);
      // You might want to show an error message to the user
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="text-lg text-red-600">
          Error loading profile: {error.message}
        </div>
      </div>
    );
  }

  // Show message if no user data
  if (!user) {
    return (
      <div className="flex items-center justify-center w-full h-64">
        <div className="text-lg">No profile data available</div>
      </div>
    );
  }
  console.log("User posts data:", postsData); //del me 316
  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full px-0 mx-auto sm:px-4 max-w-7xl">
        {/* Hidden file inputs - only show for owner */}
        {isOwner && (
          <>
            <input
              type="file"
              ref={bannerInputRef}
              onChange={handleBannerUpload}
              accept="image/*"
              className="hidden"
            />
            <input
              type="file"
              ref={profileInputRef}
              onChange={handleProfileUpload}
              accept="image/*"
              className="hidden"
            />
          </>
        )}

        {/* Unified Top Section */}
        <div className="relative overflow-hidden bg-white rounded-lg shadow-sm">
          {/* Banner */}
          <div className="relative w-full h-64 bg-gray-200">
            <img
              src={bannerImage || "/default-banner.jpg"}
              alt="Banner"
              className="object-cover w-full h-full"
            />
            {/* Only show edit banner button for owner */}
            {isOwner && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute flex gap-2 bottom-4 right-4"
                onClick={triggerBannerInput}
                disabled={isUpdatingBanner}
              >
                {isUpdatingBanner ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
                {isUpdatingBanner ? "Uploading..." : "Edit Cover"}
              </Button>
            )}
          </div>

          {/* Unified Content Container */}
          <div className="relative px-6 pb-4 md:px-10">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6 md:left-10">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImage || "/default-avatar.png"} />
                  <AvatarFallback>
                    {user.name ? user.name[0] : 'U'}
                  </AvatarFallback>
                </Avatar>
                {/* Only show edit profile picture button for owner */}
                {isOwner && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="absolute bottom-0 right-0 p-2 rounded-full"
                    onClick={triggerProfileInput}
                    disabled={isUpdatingProfilePic}
                  >
                    {isUpdatingProfilePic ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="pt-20 ml-0 md:pt-6 md:ml-40">
              <div className="flex flex-col justify-between md:flex-row md:items-center">
                <div className="md:max-w-[60%]">
                  <h1 className="flex items-center gap-2 text-2xl font-bold text-black">
                    {user.name}
                    {user.verified && (
                      <BadgeCheck className="w-5 h-5 text-blue-500" />
                    )}
                  </h1>
                  <p className="text-gray-500">@{user.username}</p>
                  {(user.location || user.dob) && (
                    <p className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                      {user.location} {user.location && user.dob && <span>•</span>} {user.dob}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-8 mt-4 md:mt-0">
                  {/* Follow button for visitors */}
                  {!isOwner && currentUser && (
                    <Button
                      variant={isFollowingUser ? "outline" : "default"}
                      onClick={isFollowingUser ? handleUnfollowClick : handleFollow}
                      disabled={isFollowing || isUnfollowing}
                      className="min-w-[100px]"
                    >
                      {isFollowing || isUnfollowing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowingUser ? (
                        "Followed"
                      ) : (
                        "Follow"
                      )}
                    </Button>
                  )}
                  
                  <div className="text-center">
                    <p className="font-bold text-black">{user.postsCount || 0}</p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="w-px h-8 mx-2 bg-gray-300"></div>
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => setShowFollowers(true)}
                  >
                    <p className="font-bold text-black">{user.followersCount || 0}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="w-px h-8 mx-2 bg-gray-300"></div>
                  <div 
                    className="text-center cursor-pointer"
                    onClick={() => setShowFollowing(true)}
                  >
                    <p className="font-bold text-black">{user.followingCount || 0}</p>
                    <p className="text-sm text-gray-500">Following</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col mt-10 md:flex-row md:gap-6">
          {/* Left Side - Bio + Badges + Following */}
          <div className="self-start w-full space-y-6 md:sticky md:w-1/3 top-20">
            {/* Bio Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>About</CardTitle>
                {/* Only show edit bio button for owner */}
                {isOwner && !isEditingBio ? (
                  <Pencil
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setIsEditingBio(true)}
                  />
                ) : isOwner && (
                  <div className="flex gap-2">
                    <Check
                      className="w-4 h-4 text-green-600 cursor-pointer"
                      onClick={saveBio}
                      disabled={isUpdatingBio}
                    />
                    <X
                      className="w-4 h-4 text-red-600 cursor-pointer"
                      onClick={() => {
                        setBioInput(user.bio || "");
                        setIsEditingBio(false);
                      }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isEditingBio ? (
                  <div className="overflow-y-auto whitespace-pre-line max-h-58">
                    <p className="text-gray-700 break-words"> {user.bio || "No bio yet."}</p>
                    {isUpdatingBio && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Updating...
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={bioInput}
                      onChange={handleBioChange}
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      placeholder="Tell us about yourself..."
                      disabled={isUpdatingBio}
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{BIO_MAX_LENGTH - bioInput.length} characters remaining</span>
                      <span>{bioInput.length}/{BIO_MAX_LENGTH}</span>
                    </div>
                    {isUpdatingBio && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Saving...
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badges */}
            {user.badges && user.badges.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {user.badges.map((badge, i) => (
                    <Badge key={i} variant="secondary">
                      {badge}
                    </Badge>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Following Preview */}
            {user.following && user.following.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Following</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-3 gap-3">
                {user.following.slice(0, 9).map((u) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u.username}`}
                    className="flex flex-col items-center hover:opacity-80 transition"
                  >
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.profilePicture} />
                      <AvatarFallback>{u.username[0]}</AvatarFallback>
                    </Avatar>
                    <p className="max-w-full mt-1 text-xs truncate">@{u.username}</p>
                  </Link>
                ))}
                {user.following.length > 9 && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="col-span-3 mt-2"
                    onClick={() => setShowFollowing(true)}
                  >
                    See all following
                  </Button>
                )}
              </CardContent>
              </Card>
            )}
          </div>

          {/* Right Side - Reports + Posts */}
          <div className="w-full space-y-6 md:w-2/3">
            {/* Quick Actions - Only show for owner */}
            {isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Button
                      className="py-6 text-lg font-semibold text-white bg-red-600 hover:bg-red-700"
                      onClick={() => setOpen(true)}
                    >
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Report a Crime
                    </Button>
                    <Button className="py-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700" onClick={handleReportMissingPerson}>
                      <Search className="w-5 h-5 mr-2" />
                      Report Missing Person
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Posts Section */}
            {/* Posts Section */}
            <Card>
              <CardHeader>
                <CardTitle>Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {postsLoading ? (
                    <p className="py-4 text-center text-gray-500">Loading posts...</p>
                  ) : postsData && postsData.length > 0 ? (
                     postsData
                      .filter((post) => {
                        // ✅ Show all posts if it's your own profile
                        if (isOwner) return true;

                        // ✅ Otherwise, hide anonymous posts
                        return !post.anonymous;
                      })
                      .map((post) => (
                        <Post
                          key={post._id}
                          post={post}
                          refetchPosts={refetchPosts}
                        />
                      ))
                  ) : (
                    <p className="py-4 text-center text-gray-500">No posts yet.</p>
                  )}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* Followers Dialog */}
      <Dialog open={showFollowers} onOpenChange={setShowFollowers}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 overflow-y-auto max-h-96 scrollbar-hidden">
            {user.followers && user.followers.length > 0 ? (
              user.followers.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center justify-between pb-2 border-b"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={follower.profilePicture} />
                      <AvatarFallback>{follower.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@{follower.username}</p>
                      {follower.name && (
                        <p className="text-sm text-gray-500">{follower.name}</p>
                      )}
                    </div>
                  </div>
                  {/* Only show follow button if not the current user */}
                  {currentUser && currentUser.username !== follower.username && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={async () => {
                      try {
                        await followUser(follower.username).unwrap();
                        dispatch(setFollowStatus(true)); // optional: update Redux if needed
                        // optionally update the followers list locally
                      } catch (err) {
                        console.error("Failed to follow user:", err);
                      }
                    }}
                  >
                    Follow
                  </Button>
                )}

                </div>
              ))
            ) : (
              <p className="py-4 text-center text-gray-500">
                No followers yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Following Dialog */}
      <Dialog open={showFollowing} onOpenChange={setShowFollowing}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 overflow-y-auto max-h-96 scrollbar-hidden">
            {user.following && user.following.length > 0 ? (
              user.following.map((followedUser) => (
                <div
                  key={followedUser._id}
                  className="flex items-center justify-between pb-2 border-b"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={followedUser.profilePicture} />
                      <AvatarFallback>{followedUser.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">@{followedUser.username}</p>
                      {followedUser.name && (
                        <p className="text-sm text-gray-500">{followedUser.name}</p>
                      )}
                    </div>
                  </div>
                  {/* Only show unfollow button for owner */}
                  {isOwner && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleUnfollow(followedUser.username)}
                    >
                      Unfollow
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="py-4 text-center text-gray-500">
                Not following anyone yet.
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <ReportWizard open={open} onOpenChange={setOpen} onPostCreated={refetchPosts}/>
      
      {/* Missing Person Modal */}
      <MissingPersonModal />
      
      {/* Unfollow Confirmation Dialog */}      
      <Dialog open={showUnfollowConfirm} onOpenChange={setShowUnfollowConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unfollow @{username}?</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to unfollow this user?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowUnfollowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmUnfollow}>
              Unfollow
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}