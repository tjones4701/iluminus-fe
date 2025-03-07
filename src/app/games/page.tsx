"use client";

import { Spinner } from "@/components/spinner";
import { Game, useGames } from "@/data/games";
import { useUser } from "@/hooks/use-user";
import styles from "./page.module.scss";
import { redirect } from "next/navigation";
import { Center } from "@/components/center";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { useState } from "react";

function GameList({ games }: { games: Game[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handlePlay = (gameId: string) => {
    redirect(`/games/${gameId}`);
    // Add your game launch logic here
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 bg-clip-text text-transparent">
        Featured Games
      </h1>
      <div className="max-w-3xl mx-auto space-y-6">
        {games.map((game) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setHoveredId(game.id)}
            onHoverEnd={() => setHoveredId(null)}
          >
            <Card className="overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-xl">
              <div className="flex flex-col md:flex-row">
                <div className="flex-1 flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">
                      {game.name ?? game.id}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 md:line-clamp-none">
                      {game.description ?? "No description available."}
                    </CardDescription>
                  </CardHeader>
                  <br />
                  <CardFooter className="mt-auto">
                    <Button
                      onClick={() => handlePlay(game.id)}
                      className="group relative overflow-hidden"
                      variant={hoveredId == game.id ? "default" : "outline"}
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        <Play className="h-4 w-4" />
                        Play Now
                      </span>
                      <span
                        className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 transition-transform duration-300 ${
                          hoveredId == game.id
                            ? "translate-x-0"
                            : "translate-x-[-100%]"
                        }`}
                      />
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  const { loading, value } = useGames();
  const { user } = useUser();
  if (user?.currentGameId !== undefined) {
    redirect(`/games/${user.currentGameId}`);
  }

  if (loading) {
    return (
      <div className={styles.center}>
        <Spinner />
      </div>
    );
  }
  if (value == null) {
    return (
      <div className={styles.center}>
        <h1>Games not found</h1>
      </div>
    );
  }

  return (
    <Center>
      <GameList games={value} />
    </Center>
  );
}
