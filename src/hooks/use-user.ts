import appStore from "@/lib/store";
import { uuid } from "@/lib/uuid";
import { useEffect, useState } from "react";

type UserState = {
    id: string;
    currentGameId?: string;
}

function generateDefaultUser(): UserState {
    return {
        id: uuid(),
        currentGameId: undefined,
    };
}

export async function fetchUser(): Promise<UserState> {
    const existingData = appStore.get("user", null);
    if (existingData) {
        console.log("Existing user data found", existingData);
        return existingData;
    }
    const user = generateDefaultUser();
    appStore.set("user", user);
    return user;
}


export function useUser() {
    const [user, setUser] = useState<UserState | null>(null);
    const [isLoading, setIsLoading] = useState<boolean | undefined>(undefined);

    useEffect(() => {
        if (user == null) {
            setIsLoading(true);
            fetchUser().then((userResponse) => {
                setUser(userResponse);
            }).finally(() => {
                setIsLoading(false);
            });
        } else {
            appStore.set("user", user);
        }
    }, [user]);

    return { user, isLoading: isLoading ?? true };
}