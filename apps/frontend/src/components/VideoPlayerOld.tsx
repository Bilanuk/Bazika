'use client';

import ReactPlayer from 'react-player';
import { useEffect, useRef, useState } from 'react';

interface VideoPlayerProps {
  url: string;
}

export default function VideoPlayerOld({ url }: VideoPlayerProps) {
  const videoPlayerRef = useRef<ReactPlayer>(null);
  const [resolution, setResolution] = useState(0);
  const [levels, setLevels] = useState([] as any);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const initPlayer = () => {
    console.log(videoPlayerRef?.current?.getInternalPlayer('hls'));
    console.log(videoPlayerRef?.current);
    console.log(videoPlayerRef?.current?.getInternalPlayer('hls').levels);

    const internalPlayer = videoPlayerRef.current?.getInternalPlayer('hls');
    if (internalPlayer) {
      setResolution(internalPlayer.currentLevel.height);
      setLevels(internalPlayer.levels);
    }
  };

  const onChangeBitrate = (event: any) => {
    const internalPlayer = videoPlayerRef.current?.getInternalPlayer('hls');
    if (internalPlayer) {
      internalPlayer.nextLevel = event.target.value;
      setResolution(event.target.value);
    }
  };

  useEffect(() => {
    setResolution(
      videoPlayerRef.current?.getInternalPlayer('hls')?.currentLevel.height
    );
  }, [videoPlayerRef.current?.getInternalPlayer('hls')?.currentLevel]);

  return (
    <>
      {isClient ? (
        <>
          <select onChange={onChangeBitrate} value={resolution}>
            {levels.map((level: any, id: any) => (
              <option key={id} value={id}>
                {level.height}
              </option>
            ))}
          </select>
          <ReactPlayer
            ref={videoPlayerRef}
            onReady={initPlayer}
            url={url}
            controls
          />
        </>
      ) : (
        <h1>Server</h1>
      )}
    </>
  );
}
