import { flattenObject } from "@/lib/flatten-object";
import { quickHash } from "@/lib/hash";
import { useEffect, useMemo, useState } from "react";
import { GameInstance } from "./games";



export type TweetReactionType =
  | "like"
  | "dislike"
  | "angry"
  | "sad"
  | "happy"
  | "funny"
  | "scared";

  export const possibleReactions = [
    "like",
    "dislike",
    "angry",
    "sad",
    "happy",
    "funny",
    "scared",
  ];

export interface Tweet {
  id: string;
  name?: string;
  content: string;
  reactions: Record<string, number>;
}

type GameData = {
  summary: string;
  tweets: Tweet[];
};
function deepMerge(target: any, source: any): any {
    if (target == null) {
        return source;
    }
    if (typeof target !== 'object' || typeof source !== 'object') {
        return source;
    }

    for (const key in source) {
        if (Array.isArray(source[key])) {
            if (!Array.isArray(target[key])) {
                target[key] = [];
            }
            target[key] = source[key].map((item: any, index: number) => {
                if (typeof item === 'object' && target[key][index]) {
                    return deepMerge(target[key][index], item);
                }
                return item;
            });
        } else if (source[key] instanceof Object) {
            if (!target[key]) {
                target[key] = {};
            }
            target[key] = deepMerge(target[key], source[key]);
        } else {
            target[key] = source[key];
        }
    }

    return target;
}

export function useTweetReactorGame(game: GameInstance<GameData>) {
    game = game as GameInstance<GameData>;
    const [gamePatchData, setGamePatchData] = useState<any>(null);    
    
    const gameHash = quickHash(flattenObject(game?.data ?? {}));

    useEffect(() => {
        if (gamePatchData == null) {
            return;
        }
        setGamePatchData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[gameHash]);

    


    const mergedData = useMemo(() => {
        const mergedData: GameData = deepMerge(game?.data ?? {}, gamePatchData ?? {});
        return mergedData;
    }, [gameHash, gamePatchData]);   

    const response = useMemo(() => {
        return {...game, data: mergedData,
            reactToTweet: (tweetId: string, reactionType: TweetReactionType) => {
                const tweets: Tweet[] = JSON.parse(JSON.stringify(mergedData.tweets));
                const tweetIndex = tweets.findIndex((tweet) => tweet.id === tweetId);
                tweets[tweetIndex] = {
                    ...tweets[tweetIndex],
                    reactions: {
                        ...tweets[tweetIndex].reactions,
                        [reactionType]: (tweets[tweetIndex].reactions[reactionType] ?? 0) + 1,
                    },
                };
                const patchData = {
                    ...mergedData,
                    tweets: tweets,
                };
                setGamePatchData(patchData);
                game.doAction("onReact",{
                    tweetId: tweetId,
                    type: reactionType,
                });
            },
        }
    },[game, mergedData]);


    
    return response;
}