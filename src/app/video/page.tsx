"use client";
import { random } from "@/lib/random";
import { CustomSpeechSynthesis, useSpeech } from "@/lib/speech";
import { Player } from "@remotion/player";
import { useEffect, useMemo, useState } from "react";
import { useDebounce, useEvent, useWindowSize } from "react-use";
import { AbsoluteFill, OffthreadVideo, useVideoConfig } from "remotion";

export const MyComposition = ({
  children,
}: {
  children: string[] | string;
}) => {
  const speech = useSpeech();
  children = (Array.isArray(children) ? children : [children]) as string[];

  useEffect(() => {
    if (speech.isReady) {
      for (let i = 0; i < children.length; i++) {
        // speech.play(children[i]);
      }
    }
  }, [speech.isReady]);

  useDebounce(
    () => {
      const t = new CustomSpeechSynthesis({
        text: "Hellow world",
      });
      t.play();
    },
    100,
    []
  );

  return (
    <>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          textAlign: "center",
          alignItems: "center",
          fontSize: 40,
          color: "white",
        }}
      >
        <div
          style={{
            textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)", // Add text shadow
          }}
        >
          {speech.currentPlaying?.options?.text}
        </div>
      </AbsoluteFill>
    </>
  );
};

type MyCompProps = {
  src: string;
};
export const MyComp: React.FC<MyCompProps> = ({ src }) => {
  return <OffthreadVideo src={src} />;
};

export const MyComposition2 = () => {
  const config = useVideoConfig();
  const sourceClip = useMemo(() => {
    const sourceClip = random.integer(1, 10);
    const src = `./videos/parkour-${sourceClip}.mp4`;
    return src;
  }, []);

  return (
    <OffthreadVideo
      style={{
        width: config.width,
        height: config.height,
        position: "absolute",
        left: 0,
      }}
      muted={true}
      src={sourceClip}
    />
  );
};

function BaseVideo() {
  const story = [
    " Will Leaves EES, Heading to",
    "Parts Across the World",
    "ROCKHAMPTON, QLD – Will from",
    "Enterprise Enabling Systems is",
    "officially logging off for good,",
    "swapping Jira tickets for cocktails",
    "in Europe. 🍹✈️ In a move",
    "that has left the team",
    "shook, Will isn’t just taking leave—",
    "he’s quitting altogether. His manager",
    "reportedly muttered, 'We’re never getting",
    "that handover doc, are we?' 😭",
    "When asked for comment, Will",
    "simply said: 'Catch me in",
    "Mykonos, besties. ✌️' End of an",
    "era. Beginning of a travel-fueled",
    "fever dream. Stay tuned for",
    "Insta story updates. 📲🔥",
  ];

  return (
    <AbsoluteFill>
      <MyComposition2 />
      <MyComposition>{story}</MyComposition>
    </AbsoluteFill>
  );
}

function RemotionRoot() {
  const [started, setStarted] = useState(false);
  const size = useWindowSize();
  useEffect(() => {
    if (typeof window !== "undefined") {
      setStarted(true);
    }
  }, []);

  if (!started) {
    return <>Loading...</>;
  }
  const aspectRatio = 9 / 18;

  let width = Math.min(size.width, 400);
  width = width - 32;
  const height = width / aspectRatio;

  if (width < 0 || height < 0) {
    return <></>;
  }

  const fps = 30;
  const totalDuration = 120; // seconds

  const durationInFrames = totalDuration * fps; // total frames

  return (
    <>
      <Player
        autoPlay={true}
        component={BaseVideo}
        durationInFrames={durationInFrames}
        compositionWidth={width}
        compositionHeight={height}
        fps={30}
        alwaysShowControls={true}
        controls={true}
        loop={true}
      />
    </>
  );
}

export default function Page() {
  const [started, setStarted] = useState(false);

  useEvent("click", () => {
    if (!started) {
      setStarted(true);
    }
  });
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold">Goodbye Will!</h1>

      <br />
      {started && <RemotionRoot />}
      {!started && <>Click to start</>}
    </div>
  );
}
