import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { useNavigate } from "react-router-dom"
import { CheckCircle2 } from "lucide-react"

export default function UserCard({ user }) {
  const navigate = useNavigate()

  return (
    <Card
      className="transition-colors cursor-pointer hover:bg-gray-50"
      onClick={() => navigate(`/profile/${user.username}`)}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <Avatar className="size-12 shrink-0">
          <AvatarImage src={user.profilePicture} />
          <AvatarFallback>{user.name?.[0]?.toUpperCase() || "?"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            {user.verified && <CheckCircle2 className="size-3.5 text-blue-500 shrink-0" />}
          </div>
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
          {user.bio && <p className="text-xs text-gray-400 truncate mt-0.5">{user.bio}</p>}
        </div>
      </CardContent>
    </Card>
  )
}