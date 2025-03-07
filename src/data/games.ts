import { useAsync } from "react-use";
import { callApi } from "./api";
import { useUser } from "@/hooks/use-user";
import { useEffect, useState } from "react";

export type Game = {
    id: string;
    name: string;
    description: string;
    type: string;
    image?: string;
};

export type GameInstance<T> = {
    updating?: boolean;
    data: T
    metadata: {
        actions: { name: string, params: any[] }[];
        id: string;
        name: string;
        type: string;
        description: string;

    }
}


export async function fetchGames(): Promise<Game[]> {
    const response = await callApi('/games', "GET");
    return response?.items;
}

export async function fetchGame<T>(id: string, userId: string): Promise<GameInstance<T>> {
    const response = await callApi(`/games/${id}?userId=${userId}`, "GET");
    return response?.data;
}

export function useGames() {
    const data = useAsync(async () => {
        return fetchGames();
    });

    return data;
}

const fetchingGames = new Map<string, boolean>();
export async function fetchGameData<T>(id: string, userId: string): Promise<GameInstance<T>> {
    if (fetchingGames.get(id)) return null as any;
    fetchingGames.set(id, true);
    const response = await callApi(`/games/${id}?userId=${userId}`, "GET");
    fetchingGames.delete(id);
    return response?.data;
}

export function useGame<T = any>(id: string) {
    const [gameData, setGameData] = useState<GameInstance<T> | null>(null);
    const { user, isLoading } = useUser();

    useEffect(() => {
        if (!user) return;
        const loadUser = async () => {
            fetchGameData<T>(id, user.id).then((game) => {
                if (game) {
                    setGameData(game);
                }
            }).catch((error) => {
                console.error("Error fetching game data:", error);
            });
        }

        loadUser();


        const interval = setInterval(() => {
            loadUser()
        }, 5000);
        return () => clearInterval(interval);
    }, [id, user]);

    return { value: gameData, loading: !gameData || isLoading };
}