"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { GameInstance } from "@/data/games";
import { useEffect, useMemo, useState } from "react";
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

type TweetReactionType =
  | "like"
  | "dislike"
  | "angry"
  | "sad"
  | "happy"
  | "funny"
  | "scared";

interface Tweet {
  id: string;
  name?: string;
  content: string;
  reactions: Record<string, number>;
}

type GameData = {
  summary: string;
  tweets: Tweet[];
};

function processGameData(data: GameData): GameData {
  for (const i in data.tweets) {
    const tweet = data.tweets[i];
    console.log(tweet);
  }

  return data;
}

export function TweetReactorGame({ game }: { game: GameInstance<GameData> }) {
  const gameData = useMemo(() => {
    return processGameData(game.data);
  }, [game]);

  const [localReactions, setLocalReactions] = useState<Record<string, number>>(
    {}
  );
  useEffect(() => {}, [game]);

  const handleReaction = (tweetId: string, reactionType: TweetReactionType) => {
    // setTweetData((prevTweets) =>
    //   prevTweets.map((tweet) => {
    //     if (tweet.id === tweetId) {
    //       // Find if this reaction type exists in the group
    //       const reactionGroupIndex = tweet.reactionsGroup.findIndex(
    //         (group) => group.type === reactionType
    //       );
    //       const updatedReactionsGroup = [...tweet.reactionsGroup];
    //       if (reactionGroupIndex >= 0) {
    //         // Increment the existing reaction count
    //         updatedReactionsGroup[reactionGroupIndex] = {
    //           ...updatedReactionsGroup[reactionGroupIndex],
    //           count: updatedReactionsGroup[reactionGroupIndex].count + 1,
    //         };
    //       } else {
    //         // Add a new reaction type
    //         updatedReactionsGroup.push({
    //           type: reactionType,
    //           count: 1,
    //         });
    //       }
    //       // Add to the reactions array too
    //       const updatedReactions = [
    //         ...tweet.reactions,
    //         {
    //           tweetId,
    //           userId: "current-user", // In a real app, this would be the actual user ID
    //           type: reactionType,
    //         },
    //       ];
    //       return {
    //         ...tweet,
    //         reactions: updatedReactions,
    //         reactionsGroup: updatedReactionsGroup,
    //       };
    //     }
    //     return tweet;
    //   })
    // );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-4">
        {gameData.tweets.map((tweet) => (
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
    setLocalReactions((prev) => ({
      ...prev,
      [type]: 1,
    }));
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
                    (tweet.reactions[type] ?? 0) + (localReactions[type] ?? 0)
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
