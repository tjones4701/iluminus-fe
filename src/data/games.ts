import { useAsync } from "react-use";
import { callApi } from "./api";
import { fetchUser, useUser } from "@/hooks/use-user";
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
    },
    doAction: (actionName: string, ...args: any[]) => Promise<any>;
}


export  async function callAuthenticatedApi(url: string, method: string, body?: any) {
    const user = await fetchUser();

    const headers = {
        'x-user-id': user.id,
    };
    return await callApi(url, method, body, headers);
}

export async function fetchGames(): Promise<Game[]> {
    const response = await callAuthenticatedApi('/games', "GET");
    return response?.items;
}

export async function fetchGame<T>(id: string, userId: string): Promise<GameInstance<T>> {
    const response = await callAuthenticatedApi(`/games/${id}?userId=${userId}`, "GET");
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
    const response = await callAuthenticatedApi(`/games/${id}?userId=${userId}`, "GET");
    fetchingGames.delete(id);
    return response?.data;
}

async function doGameAction(id: string, actionName: string, args: any[]) {
    const response = await callAuthenticatedApi(`/games/${id}/actions`, "POST", { actionName: actionName, data: args });
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


    const doAction = async (actionName: string, ...args: any[]) => {
        if (!gameData) return;
        await doGameAction(gameData.metadata.id, actionName, args);
    }

    const value = {
        ...gameData,
        doAction: doAction,
    }

    return { value: value, loading: !gameData || isLoading };
}