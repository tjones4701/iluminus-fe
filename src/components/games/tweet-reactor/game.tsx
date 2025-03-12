"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { GameInstance } from "@/data/games";
import { Tweet, TweetReactionType, useTweetReactorGame } from "@/data/use-tweet-reactor-game";
import { useEffect, useState } from "react";
import { ReactionButton } from "./reaction-button";

const possibleReactions = [
  "like",
  "dislike",
  "angry",
  "sad",
  "happy",
  "funny",
  "scared",
];


export function TweetReactorGame({ game }: { game: GameInstance<any>}) {
  const tweetGame = useTweetReactorGame(game);

  const handleReaction = (tweetId: string, reactionType: TweetReactionType) => {
    tweetGame.reactToTweet(tweetId, reactionType);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-4">
        {tweetGame.data.tweets.map((tweet) => (
          <TweetCard
            key={tweet.id}
            tweet={tweet}
            onReaction={(type) => handleReaction(tweet.id, type)}
          />
        ))}
      </div>
    </div>
  );
}

function TweetCard({
  tweet,
  onReaction,
}: {
  tweet: Tweet;
  onReaction: (type: TweetReactionType) => void;
}) {
  const [localReactions, setLocalReactions] = useState<Record<string, number>>(
    {}
  );
  useEffect(() => {
    setLocalReactions({});
  }, [tweet]);

  if (tweet.name == null) {
    tweet.name = "Anonymous";
  }

  const handleReaction = (type: TweetReactionType) => {

    onReaction(type);
  };
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={`/placeholder.svg?height=40&width=40`}
              alt={tweet.name}
            />
            <AvatarFallback>{tweet.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold">{tweet.name}</span>
            </div>
            <p className="text-sm">{tweet.content}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t bg-muted/20 px-4 py-2">
        <div className="flex w-full flex-wrap gap-2">
          {possibleReactions.length && (
            <div className="relative group">
              {possibleReactions.map((type) => (
                <ReactionButton
                  key={type}
                  type={type as TweetReactionType}
                  count={
                    (tweet.reactions[type] ?? 0)
                  }
                  selected={localReactions[type] > 0}
                  onClick={() => handleReaction(type as TweetReactionType)}
                  className="opacity-70 hover:opacity-100"
                />
              ))}
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
