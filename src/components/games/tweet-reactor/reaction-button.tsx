"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Heart,
  MessageCircle,
  Share,
  ThumbsDown,
  Flame,
  Frown,
  Smile,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TweetReactionType =
  | "like"
  | "dislike"
  | "angry"
  | "sad"
  | "happy"
  | "funny"
  | "scared";

interface ReactionButtonProps {
  type: TweetReactionType;
  count: number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ReactionButton({
  type,
  count,
  selected,
  onClick,
  className,
}: ReactionButtonProps) {
  const [currentCount, setCurrentCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (count !== currentCount) {
      setIsAnimating(true);
      const diffPercentage = 1 - currentCount / count;
      let speed = 300 - 300 * diffPercentage;
      let changeAmount = 1;

      const diff = Math.abs(count - currentCount);
      if (speed < 500) {
        changeAmount = Math.floor(diff / 2);
        speed = 100;
      }
      if (diff == 1) {
        setCurrentCount(count);
        return;
      }
      //   const interval = Math.abs(difference);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        if (diffPercentage > 0) {
          setCurrentCount(currentCount + changeAmount);
        } else {
          setCurrentCount(currentCount - changeAmount);
        }
      }, speed); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [count, currentCount, type]);

  const getIcon = () => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4" />;
      case "dislike":
        return <ThumbsDown className="h-4 w-4" />;
      case "angry":
        return <Flame className="h-4 w-4 text-orange-500" />;
      case "sad":
        return <Frown className="h-4 w-4 text-blue-500" />;
      case "happy":
        return <Smile className="h-4 w-4 text-yellow-500" />;
      case "funny":
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      case "scared":
        return <Share className="h-4 w-4 text-gray-500" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn("gap-1 text-muted-foreground", className)}
      onClick={onClick}
    >
      {getIcon()}
      <span
        className={cn(
          "text-xs transition-all duration-300",
          isAnimating && "scale-125 text-primary",
          selected && "text-primary"
        )}
      >
        {currentCount}
      </span>
    </Button>
  );
}
