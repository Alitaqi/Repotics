import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// For demo, later fetch from Redux or backend
const samplePost = {
  name: "Victor Gyokeres",
  username: "victor_g",
  verified: true,
  badge: "Neighborhood Watch",
  time: "2h ago",
  description: "Robbery reported near Liberty Market. Suspects were last seen heading towards Gulberg.",
  crimeType: "Robbery",
  hashtags: ["#Robbery", "#StaySafe", "#Reportics"],
  images: ["/src/assets/images/crime1.jpeg", "/src/assets/images/crim2.jpg"],
  likes: 124,
  comments: 12,
};

export default function PostCard() {
  return (
    <Card className="shadow-sm rounded-xl">
      <CardContent className="p-4">
        {/* Top Section */}
        <div className="flex items-center justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src="/profile.jpg" alt={samplePost.name} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{samplePost.name}</h3>
                {samplePost.verified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                )}
                {/* Crime Type Badge */}
                <Badge variant="secondary">{samplePost.crimeType}</Badge>
              </div>
              <p className="text-sm text-gray-500">
                @{samplePost.username} • {samplePost.time}
              </p>
            </div>
          </div>

          {/* Right: Follow + Menu */}
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline">
              Follow
            </Button>
            <Button size="icon" variant="ghost">
              <MoreHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-sm">{samplePost.description}</p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2 mt-2">
          {samplePost.hashtags.map((tag, i) => (
            <Badge key={i} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Image Slider (basic for now) */}
        <div className="mt-3">
          <img
            src={samplePost.images[1]}
            alt="crime evidence"
            className="object-cover w-full h-64 rounded-lg"
          />
          {/* Later: implement carousel if >1 image */}
        </div>

        {/* Likes + Comments count */}
        <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
          <span>{samplePost.likes} Reactions</span>
          <span>{samplePost.comments} Comments</span>
        </div>

        <hr className="my-3" />

        {/* Reaction Buttons */}
        <div className="flex justify-around">
          <Button variant="ghost" className="flex-1">
            😀 Like
          </Button>
          <Button variant="ghost" className="flex-1">
            😡 Angry
          </Button>
          <Button variant="ghost" className="flex-1">
            😢 Sad
          </Button>
          <Button variant="ghost" className="flex-1">
            💬 Comment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
