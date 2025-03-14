"use client";
import { useEffect, useState } from "react";
import { quickHash } from "./hash";
import { uuid } from "./uuid";

const apiKey = '*****'


type SpeechResponse = {
    CreationTime: string;
    OutputUri: string;
    RequestCharacters: number;
    TaskId: string;
    TaskStatus: string;
    TimestampsUri: string;
    VoiceId: string;
};



type VoiceOptions = {
    lang?: string;
    localService?: boolean;
    voiceName?: string;
    voiceURI?: string;
};

type VoiceUtteranceOptions = VoiceOptions & {
    text: string;
    rate?: number;
    pitch?: number;
    volume?: number;
}

type SpeechSynthesisStatus = "initialising" | "ready" | "playing" | "paused" | "stopped" | "error";

type SpeechSynthesisOptions = {
    text: string;
    voiceId?: "bm_george",
    languageId?: "British",
    bitrate?: "48k",
    pitch?: 1,
    speed?: 0
}
export class CustomSpeechSynthesis {
    id: string = uuid();
    data?: SpeechResponse = undefined;
    config: SpeechSynthesisOptions;
    audio: HTMLAudioElement | null = null;
    shouldPlay: boolean = false;
    status: SpeechSynthesisStatus = "initialising";

    // Events
    onStart: () => void = () => { };
    onEnd: () => void = () => { };
    onError: () => void = () => { };
    onPause: () => void = () => { };
    onResume: () => void = () => { };


    constructor(config: SpeechSynthesisOptions) {
        this.config = config;
        this.init();
    }

    get canPlay() {
        return this.status == "ready" || this.status == "paused" || this.status == "stopped";
    }

    async init() {
        this.status = "initialising";
        try {
            await this.fetchSpeechResponse();
            if (this.data?.OutputUri == null) {
                throw new Error("No OutputUri");
            }
            const audio = new Audio(this.data.OutputUri);
            this.audio = audio;
            await new Promise((resolve, reject) => {
                audio.onloadeddata = () => {
                    resolve(true);
                };
                audio.onerror = () => {
                    reject(false);
                };
            });
            this.status = "ready";
            if (this.shouldPlay) {
                this.play();
            }
        } catch (e) {
            this.status = "error";
            console.error(e);
            return;
        }
    }

    async fetchSpeechResponse() {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", apiKey);

        const data = {
            Text: this.config.text,
            VoiceId: this.config.voiceId ?? "bm_george",
            LanguageId: this.config.languageId ?? "British",
            Bitrate: this.config.bitrate ?? "48k",
            Pitch: this.config.pitch ?? 1,
            Speed: this.config.speed ?? 0,
        };


        const response = await fetch("https://api.v8.unrealspeech.com/stream", {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": 'Bearer ' + apiKey,
            },
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }
        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("No reader");
        }
        const responseJson = await response.json();
        this.data = responseJson as SpeechResponse;
    }

    start() {
        this.onStart();
    }
    end() {
        this.onEnd();
    }

    isReady() {

    }
    play() {
        if (this.status == 'initialising') {
            this.shouldPlay = true;
        } else {
            this.shouldPlay = false;
        }
        if (!this.canPlay) {
            return;
        }
        this.status = "playing";
    }
}

function getVoices(options?: VoiceOptions) {
    options = { ...(options ?? {}) };
    const voices = window.speechSynthesis.getVoices();
    options.localService = options.localService ?? true;
    return voices.filter((voice) => {
        return (
            (options.lang === undefined || voice.lang === options.lang) &&
            voice.localService === options.localService &&
            (options.voiceName === undefined || voice.name === options.voiceName) &&
            (options.voiceURI === undefined || voice.voiceURI === options.voiceURI)
        );
    });
}

function getFirstVoice(options: VoiceOptions) {
    const voices = getVoices(options);
    if (voices.length > 1) {
        return voices.find((voice) => voice.default) ?? voices[0];
    } else if (voices.length == 1) {
        return voices[0];
    } else {
        return null;
    }
}

type CreateUtteranceArgs = [
    VoiceUtteranceOptions
] | [
    string,
    VoiceUtteranceOptions?
]

type PlayArgs = CreateUtteranceArgs | [number] | [string] | [VoiceSystemUtterance];

type VoiceSystemUtteranceStatus = "start" | "pause" | "resume" | "end" | "error" | "cancel" | "none"


type VoiceSystemUtterance = {
    utterance: SpeechSynthesisUtterance;
    id: number;
    options: VoiceUtteranceOptions;
    status: VoiceSystemUtteranceStatus;
    playing: boolean;
}


class VoiceSystem {
    playing: boolean = false;
    paused: boolean = false;
    current: SpeechSynthesis | null = null;
    utterances: SpeechSynthesis[] = [];
    listeners: Record<string, ((vs: VoiceSystem) => void)> = {};
    isReady: boolean = false;
    constructor() {
        this.init();
    }

    init() {
        this.checkReady();
    }

    checkReady() {
        if (this.isReady) {
            return;
        }
        if (getVoices().length > 0) {
            this.isReady = true;
            this.onUpdate();
            return;
        }
        setTimeout(() => {
            this.checkReady();
        }, 100);
    }

    subscribe(listener: (vs: VoiceSystem) => void) {
        const id = uuid();
        this.listeners[id] = listener;
        if (this.isReady) {
            setTimeout(() => {
                listener(this);
            }, 0);
        }
        return {
            id: id,
            unsubscribe: () => {
                this.unsubscribe(id);
                delete this.listeners[id];
            }
        }
    }
    unsubscribe(id: string | { id: string, unsubscribe: () => void }) {
        if (typeof id === "object") {
            id = id.id;
        }
        if (this.listeners[id]) {
            delete this.listeners[id];
        }
    }

    onUpdate() {
        for (const id in this.listeners) {
            const listener = this.listeners[id];
            listener(this);
        }
        if (this.current != null) {
            this.checkPlayNext();
        }
    }


    onPause(id: number) {
        const utterance = this.getUtterance(id);
        if (utterance) {
            utterance.status = "pause";
            this.onUpdate();
        }
    }
    onResume(id: number) {
        const utterance = this.getUtterance(id);
        if (utterance) {
            utterance.status = "resume";
            this.onUpdate();
        }
        this.onUpdate();
    }
    onStart(id: number) {
        const utterance = this.getUtterance(id);
        if (utterance) {
            utterance.playing = true
            utterance.status = "start";
            this.onUpdate();
        }
    }
    onEnd(id: number) {
        const utterance = this.getUtterance(id);
        if (utterance) {
            utterance.status = "end";
            this.stopCurrent();
        }
    }
    onError(id: number) {
        const utterance = this.getUtterance(id);
        if (utterance) {
            utterance.status = "error";
            this.stopCurrent();
        }
    }
    onCancel(id: number) {
        const utterance = this.getUtterance(id);
        if (utterance) {
            utterance.status = "cancel";
            this.stopCurrent();
        }
    }

    getFirstUtterance() {
        if (this.utterances.length > 0) {
            return this.utterances[0];
        }
        return null;
    }

    stopCurrent() {
        if (this.current) {
            this.current.playing = false;
            const first = this.getFirstUtterance();
            if (first?.id == this.current.id) {
                this.utterances.shift();
            }
            this.onUpdate();
            this.current = null;
            this.checkPlayNext();
        }
    }

    playCurrent() {
        if (this.current == null) {
            return;
        }
        const utterance = this.current;
        if (!utterance.playing) {
            utterance.playing = true;
            utterance.status = "start";
            window.speechSynthesis.speak(utterance.utterance);
            this.onUpdate();
        }
    }

    getUtterance(id: number): VoiceSystemUtterance | null {
        return this.utterances.find((u) => u.id === id) ?? null;
    }
    hasUtterance(id: number): boolean {
        return this.getUtterance(id) !== null;
    }
    /**
     * 
     * @param param0 text | options
     * @returns 
     */
    createUtterance(...[text, options]: CreateUtteranceArgs) {
        options = typeof text === "string" ? options : text;
        text = typeof text === "string" ? text : (options?.text ?? "");
        options = options ?? { text: text };
        if (text === "") {
            throw new Error("Text is empty");
        }
        if (typeof text !== "string") {
            throw new Error("Text is not a string");
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const voice = getFirstVoice(options);
        if (voice == null) {
            throw new Error("No voice found");
        }
        const id = quickHash({
            ...options,
            voiceURI: voice?.voiceURI
        });
        const existingUtterance = this.getUtterance(id);
        if (existingUtterance) {
            return existingUtterance;
        }
        utterance.lang = options.lang || voice?.lang || "en-US";
        utterance.rate = options.rate || 1.5;
        utterance.pitch = options.pitch || 1;
        utterance.volume = options.volume || 1;
        utterance.onstart = () => {
            this.onStart(id);
        };
        utterance.onpause = () => {
            this.onPause(id);
        };
        utterance.onresume = () => {
            this.onResume(id);
        };
        utterance.onend = () => {
            this.onEnd(id);
        };
        utterance.onerror = () => {
            this.onError(id);
        };
        const vsUtterance = {
            utterance: utterance,
            id: id,
            options: options as VoiceUtteranceOptions,
            status: "none" as VoiceSystemUtteranceStatus,
            playing: false
        }
        this.utterances.push(vsUtterance);
        return vsUtterance;
    }

    play(...args: PlayArgs) {
        let utterance: VoiceSystemUtterance | null = null;
        /**
         * * If args is a single number, it is the id of the utterance to play.
         */
        if (args.length == 1) {
            if (typeof args[0] === "number") {
                utterance = this.getUtterance(args[0] as number);
            } else if (typeof args[0] === "string") {
                utterance = this.createUtterance({ text: args[0] as string });
            } else {
                utterance = (args[0] as VoiceSystemUtterance);
            }
        } else {
            utterance = this.createUtterance(...args);
        }

        if (!utterance) {
            throw new Error("Utterance is null");
        }

        this.checkPlayNext();
    }

    checkPlayNext() {
        if (this.current?.playing) {
            return;
        }
        const first = this.getFirstUtterance();
        if (first) {
            this.current = first;
            this.playCurrent();
        } else {
            this.current = null;
        }

    }

}

export const speech = new VoiceSystem();





export function useSpeech() {
    const [isReady, setIsReady] = useState(false);
    const [currentPlaying, setCurrentPlaying] = useState<VoiceSystemUtterance | null>(null);
    useEffect(() => {
        const sub = speech.subscribe(() => {
            if (speech.isReady) {
                setIsReady(true);
            }
            setCurrentPlaying(speech.current);
        });
        return () => {
            sub.unsubscribe()
        }
    }, []);

    const play = (...args: PlayArgs): boolean => {
        if (!isReady) {
            return false;
        }
        speech.play(...args);
        return true;
    }

    useEffect(() => {
        if (!currentPlaying) {
            return;
        }
    }, [currentPlaying?.status]);

    return { currentPlaying: currentPlaying, isReady: isReady, voiceSystem: speech, play };

}
