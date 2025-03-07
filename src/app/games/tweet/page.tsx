import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Repeat, Share } from "lucide-react"

interface Tweet {
  id: string
  user: {
    name: string
    handle: string
    avatar: string
  }
  content: string
  stats: {
    likes: number
    retweets: number
    replies: number
  }
  timestamp: string
}

const tweets: Tweet[] = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      handle: "@sarahjohnson",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just finished reading an amazing book on sustainable architecture. So many innovative ideas that could transform our cities! 🌱🏙️ #SustainableLiving #Architecture",
    stats: {
      likes: 42,
      retweets: 12,
      replies: 5,
    },
    timestamp: "2h ago",
  },
  {
    id: "2",
    user: {
      name: "Tech Insights",
      handle: "@techinsights",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Breaking: New AI model demonstrates unprecedented reasoning capabilities in complex problem-solving scenarios. This could revolutionize everything from scientific research to everyday applications. #AIAdvancement #TechNews",
    stats: {
      likes: 189,
      retweets: 56,
      replies: 23,
    },
    timestamp: "4h ago",
  },
  {
    id: "3",
    user: {
      name: "Alex Rivera",
      handle: "@alexrivera",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    content:
      "Just hiked to the summit of Mt. Rainier! The view was absolutely breathtaking. Definitely worth the 4am start and sore legs. 🏔️ #Hiking #MtRainier #Adventure",
    stats: {
      likes: 87,
      retweets: 14,
      replies: 9,
    },
    timestamp: "6h ago",
  },
]

export default function TwitterFeed() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-4">
        {tweets.map((tweet) => (
          <TweetCard key={tweet.id} tweet={tweet} />
        ))}
      </div>
    </div>
  )
}

function TweetCard({ tweet }: { tweet: Tweet }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={tweet.user.avatar} alt={tweet.user.name} />
            <AvatarFallback>{tweet.user.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{tweet.user.name}</span>
              <span className="text-sm text-muted-foreground">{tweet.user.handle}</span>
              <span className="text-sm text-muted-foreground">· {tweet.timestamp}</span>
            </div>
            <p className="text-sm">{tweet.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-4 py-2">
        <div className="flex w-full justify-between">
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <MessageCircle className="h-4 w-4" />
            <span className="text-xs">{tweet.stats.replies}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Repeat className="h-4 w-4" />
            <span className="text-xs">{tweet.stats.retweets}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
            <Heart className="h-4 w-4" />
            <span className="text-xs">{tweet.stats.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

