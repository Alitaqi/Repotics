// components/ProfileCard.jsx

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export default function ProfileCard({ user }) {

  // If user not loaded yet (first render)
  if (!user) {
    return (
      <Card className="w-full overflow-hidden shadow-md rounded-2xl">
        <CardContent className="py-10 text-center text-gray-500">
          Loading profile...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-hidden shadow-md rounded-2xl">
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-r from-blue-500 to-purple-500">
        {user.bannerPicture && (
          <img
            src={user.bannerPicture}
            alt="Profile banner"
            className="absolute inset-0 object-cover w-full h-full"
          />
        )}

        {/* Profile Avatar */}
        <div className="absolute transform -translate-x-1/2 -bottom-10 left-1/2">
          <Avatar className="w-20 h-20 border-4 border-white shadow-md">
            <AvatarImage
              src={user.profilePicture || "/default-avatar.png"}
              alt={user.name}
            />
            <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <CardContent className="pt-8 text-center">
        <h2 className="text-lg font-semibold">
          <Link to={`/profile/${user.username}`}>
            {user.name}
          </Link>
        </h2>

        <p className="text-sm text-gray-500">
          <Link to={`/profile/${user.username}`}>
            @{user.username}
          </Link>
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 my-4 text-sm">
          <div>
            <p className="font-bold">{user.postsCount ?? 0}</p>
            <p className="text-gray-500">Posts</p>
          </div>
          <div>
            <p className="font-bold">{Array.isArray(user.followers) ? user.followers.length : user.followers ?? 0}</p>
            <p className="text-gray-500">Followers</p>
          </div>
          <div>
            <p className="font-bold">{Array.isArray(user.following) ? user.following.length : user.following ?? 0}</p>
            <p className="text-gray-500">Following</p>
          </div>
        </div>

        {/* Badges */}
        {user?.badges?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2">
            {user.badges.map((badge, i) => (
              <Badge key={i} variant="secondary">
                {badge}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
