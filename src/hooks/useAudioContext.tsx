import { useEffect, useRef } from "react";

type AudioEventListeners = {
  onPlay?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
};

const useAudioContext = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  // 避免同一个 audio 被绑定到多个不同节点
  const audioContextRef = useRef<AudioContext | null>(null);
  // 绑定外部的音频事件处理
  const audioListenersRef = useRef<AudioEventListeners>({});

  const handleInit = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  };

  const handlePlay = () => {
    audioListenersRef.current.onPlay?.();
  };

  const handlePause = () => {
    audioListenersRef.current.onPause?.();
  };

  const handleEnd = () => {
    audioListenersRef.current.onEnd?.();
  };

  useEffect(() => {
    if (!audioRef.current) return;

    handleInit();

    audioRef.current.addEventListener("play", handlePlay);
    audioRef.current.addEventListener("pause", handlePause);
    audioRef.current.addEventListener("ended", handleEnd);

    return () => {
      audioRef.current?.removeEventListener("play", handlePlay);
      audioRef.current?.removeEventListener("pause", handlePause);
      audioRef.current?.removeEventListener("ended", handleEnd);
    };
  }, []);

  return {
    audioRef,
    audioListenersRef
  };
};

export default useAudioContext;
