// components/ProfileCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProfileCard() {
  return (
    <Card className="w-full overflow-hidden shadow-md rounded-2xl">
      {/* Banner */}
      <div className="relative h-20 bg-gradient-to-r from-blue-500 to-purple-500">
        {/* Profile Avatar */}
        <div className="absolute transform -translate-x-1/2 -bottom-10 left-1/2">
          <Avatar className="w-20 h-20 border-4 border-white shadow-md">
            <AvatarImage src="/profile.jpg" alt="user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Content */}
      <CardContent className="text-center pt-14">
        <h2 className="text-lg font-semibold">Victor Gyokeres</h2>
        <p className="text-sm text-gray-500">@victor_g</p>

        {/* Stats */}
        <div className="flex justify-center gap-6 my-4 text-sm">
          <div>
            <p className="font-bold">133</p>
            <p className="text-gray-500">Posts</p>
          </div>
          <div>
            <p className="font-bold">4.2M</p>
            <p className="text-gray-500">Followers</p>
          </div>
          <div>
            <p className="font-bold">12</p>
            <p className="text-gray-500">Following</p>
          </div>
        </div>

        {/* Tags (placeholder for now) */}
        <div className="flex flex-wrap justify-center gap-2">
          <Badge variant="secondary">#Batman</Badge>
          <Badge variant="secondary">#Volunteer</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
