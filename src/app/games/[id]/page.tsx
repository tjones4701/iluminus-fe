"use client";

import { TweetReactorGame } from "@/components/games/tweet-reactor/game";
import { useGame } from "@/data/games";
import { useParams } from "next/navigation";

export default function Page() {
  const { id } = useParams();

  const { value: game, loading } = useGame(id?.toString() ?? "");
  if (loading) {
    return (
      <div>
        <h1>Loading...</h1>
      </div>
    );
  }
  if (game == null) {
    return (
      <div>
        <h1>Game not found</h1>
      </div>
    );
  }
  if (game.metadata.type == "TweetReactorGame") {
    return <TweetReactorGame game={game as any} />;
  }
  return <h1>Game not foun</h1>;
}
