
export type Color = [number, number, number];
const randomObj = {
    integer: (min: number, max: number): number => {
        return Math.round(Math.random() * (max - min) + min);
    },
    number: (min: number, max: number): number => {
        return Math.random() * (max - min) + min;
    },
    fromArray: <T>(arr: T[]): T => {
        return arr[Math.floor(Math.random() * arr.length)];
    },
    array: <T>(arr: T[]): T[] => {
        return arr.sort(() => Math.random() - 0.5);
    },
    boolean: (): boolean => {
        return Math.random() > 0.5;
    },
    backgroundColorStyle: (): string => {
        const styles = ["bg-green", "bg-blue"];
        return styles[Math.floor(Math.random() * styles.length)];
    },
    guidV4: (): string => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c === "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16);
            }
        );
    },
    phoneNumber: (): string => {
        let str = "04";
        for (let i = 0; i < 8; i++) {
            str = str + randomObj.integer(0, 9);
        }
        return str;
    },
    email: (): string => {
        const start = ["fake", "bad", "ok", "word", "breakingTheDesigns6006"];
        const end = [
            "cqu.edu.au",
            "fake.com",
            "testing.au",
            "myAwesomeWebsite.com.au",
        ];
        return randomObj.array(start) + "@" + randomObj.array(end);
    },
    character: (
        includeLetters: boolean = true,
        includeNumbers: boolean = false
    ): string => {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        const numbers = "0123456789";
        let rnd = "";
        if (!includeLetters && !includeNumbers) {
            return "";
        }
        if (includeNumbers) {
            rnd = rnd + numbers;
        }
        if (includeLetters) {
            rnd = rnd + letters;
        }
        return rnd.charAt(randomObj.number(0, rnd.length));
    },
    color(): Color {
        return [
            randomObj.integer(0, 255),
            randomObj.integer(0, 255),
            randomObj.integer(0, 255)
        ]
    },
};

export const random = randomObj;
