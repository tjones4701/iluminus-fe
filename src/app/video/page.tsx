"use client";
import { Player } from "@remotion/player";
import { useEffect, useState } from "react";
import { useWindowSize } from "react-use";
import {
  AbsoluteFill,
  OffthreadVideo,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const MyComposition = () => {
  const frame = useCurrentFrame();

  const opacity = Math.min(1, frame / 60);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        fontSize: 80,
      }}
    >
      <div style={{ opacity: opacity }}>Hello World!</div>
    </AbsoluteFill>
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
  const startFrame = 60;

  const duration = config.durationInFrames;

  return (
    <OffthreadVideo
      style={{
        width: config.width,
        height: config.height,
        position: "absolute",
        left: 0,
      }}
      muted={true}
      src="./videos/parkour-1.mp4"
      startFrom={startFrame}
      endAt={startFrame + duration}
    />
  );
};

function BaseVideo() {
  return (
    <AbsoluteFill>
      <MyComposition2 />
      <MyComposition />
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

  return (
    <>
      <Player
        autoPlay={true}
        component={BaseVideo}
        durationInFrames={120}
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
  return (
    <div className="flex flex-col h-screen w-full items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold">Video Page</h1>
      <br />
      <RemotionRoot />
    </div>
  );
}
