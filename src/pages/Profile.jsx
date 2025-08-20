// pages/Profile.jsx
import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Pencil, Camera, Check, X, BadgeCheck, AlertTriangle, Search } from "lucide-react";
import Post from "@/components/layout/PostCard";
import ReportWizard from "@/components/layout/ReportWizard";
import { setBio, setBannerImage, setProfileImage, unfollow } from "@/lib/redux/slices/profileSlice";

export default function Profile() {
  const dispatch = useDispatch();

  // Select from Redux
  const user = useSelector((s) => s.profile.user);
  const bannerImage = useSelector((s) => s.profile.images.bannerImage);
  const profileImage = useSelector((s) => s.profile.images.profileImage);

  // Local UI state only (no visual change)
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio);
  const [showFollowers, setShowFollowers] = useState(false);
  const [open, setOpen] = useState(false);

  const bannerInputRef = useRef(null);
  const profileInputRef = useRef(null);

  const BIO_MAX_LENGTH = 150;

  const handleBannerUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      dispatch(setBannerImage(event.target.result));
    };
    reader.readAsDataURL(file);
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      dispatch(setProfileImage(event.target.result));
    };
    reader.readAsDataURL(file);
  };

  const triggerBannerInput = () => bannerInputRef.current?.click();
  const triggerProfileInput = () => profileInputRef.current?.click();

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= BIO_MAX_LENGTH) setBioInput(value);
  };

  const saveBio = () => {
    dispatch(setBio(bioInput));
    setIsEditingBio(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full px-0 mx-auto sm:px-4 max-w-7xl">
        {/* Hidden file inputs */}
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

        {/* Unified Top Section */}
        <div className="relative overflow-hidden bg-white rounded-lg shadow-sm">
          {/* Banner */}
          <div className="relative w-full h-64 bg-gray-200">
            <img
              src={bannerImage}
              alt="Banner"
              className="object-cover w-full h-full"
            />
            <Button
              size="sm"
              variant="secondary"
              className="absolute flex gap-2 bottom-4 right-4"
              onClick={triggerBannerInput}
            >
              <Camera className="w-4 h-4" /> Edit Cover
            </Button>
          </div>

          {/* Unified Content Container */}
          <div className="relative px-6 pb-4 md:px-10">
            {/* Profile Picture */}
            <div className="absolute -top-16 left-6 md:left-10">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg">
                  <AvatarImage src={profileImage} />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute bottom-0 right-0 p-2 rounded-full"
                  onClick={triggerProfileInput}
                >
                  <Camera className="w-4 h-4" />
                </Button>
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
                  <p className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    {user.location} <span>•</span> {user.birthdate}
                  </p>
                </div>

                <div className="flex items-center gap-8 mt-4 md:mt-0">
                  <div className="text-center">
                    <p className="font-bold text-black">{user.posts}</p>
                    <p className="text-sm text-gray-500">Posts</p>
                  </div>
                  <div className="w-px h-8 mx-2 bg-gray-300"></div>
                  <div
                    className="text-center cursor-pointer"
                    onClick={() => setShowFollowers(true)}
                  >
                    <p className="font-bold text-black">{user.followers}</p>
                    <p className="text-sm text-gray-500">Followers</p>
                  </div>
                  <div className="w-px h-8 mx-2 bg-gray-300"></div>
                  <div className="text-center">
                    <p className="font-bold text-black">{user.following}</p>
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
                {!isEditingBio ? (
                  <Pencil
                    className="w-4 h-4 cursor-pointer"
                    onClick={() => setIsEditingBio(true)}
                  />
                ) : (
                  <div className="flex gap-2">
                    <Check
                      className="w-4 h-4 text-green-600 cursor-pointer"
                      onClick={saveBio}
                    />
                    <X
                      className="w-4 h-4 text-red-600 cursor-pointer"
                      onClick={() => {
                        setBioInput(user.bio);
                        setIsEditingBio(false);
                      }}
                    />
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {!isEditingBio ? (
                  <div className="overflow-y-auto whitespace-pre-line max-h-58">
                    <p className="text-gray-700 break-words">{user.bio}</p>
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={bioInput}
                      onChange={handleBioChange}
                      className="w-full p-2 border rounded-md min-h-[100px]"
                      placeholder="Tell us about yourself..."
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>{150 - bioInput.length} characters remaining</span>
                      <span>{bioInput.length}/150</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Badges */}
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

            {/* Following */}
            <Card>
              <CardHeader>
                <CardTitle>Following</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                {user.followingUsers.slice(0, 9).map((u) => (
                  <div key={u.id} className="flex flex-col items-center">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.avatar} />
                      <AvatarFallback>{u.name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="mt-1 text-xs">{u.name}</p>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="col-span-3 mt-2"
                  onClick={() => setShowFollowers(true)}
                >
                  See all followers
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Reports + Posts */}
          <div className="w-full space-y-6 md:w-2/3">
            {/* Quick Actions */}
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
                  <Button className="py-6 text-lg font-semibold text-white bg-blue-600 hover:bg-blue-700">
                    <Search className="w-5 h-5 mr-2" />
                    Report Missing Person
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Section */}
            <Card>
              <CardHeader>
                <CardTitle>Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Post
                    author={user.name}
                    avatar={profileImage}
                    content="This is a sample post content that would appear in the feed."
                    timestamp="2 hours ago"
                    likes={15}
                    comments={3}
                  />
                  <Post
                    author={user.name}
                    avatar={profileImage}
                    content="Another post example showing how the feed would look with multiple posts."
                    timestamp="1 day ago"
                    likes={42}
                    comments={7}
                  />
                  <Post
                    author={user.name}
                    avatar={profileImage}
                    content="Community safety is everyone's responsibility. Stay vigilant and report suspicious activities."
                    timestamp="3 days ago"
                    likes={28}
                    comments={5}
                  />
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
            {user.followingUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between pb-2 border-b"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={u.avatar} />
                    <AvatarFallback>{u.name[0]}</AvatarFallback>
                  </Avatar>
                  <p>{u.name}</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => dispatch(unfollow(u.id))}
                >
                  Unfollow
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <ReportWizard open={open} onOpenChange={setOpen} />
    </div>
  );
}
