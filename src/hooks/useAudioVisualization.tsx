import { useEffect, useRef } from "react";

import { useAudioContext } from "@/hooks";
import { useAudioStore, useCanvasStore } from "@/stores";

const useAudioVisualization = () => {
  const reqIdRef = useRef<number | null>(null);

  const { audioBuffer } = useAudioStore();
  const { canvasInstance, builderFactory } = useCanvasStore();
  const { audioRef, audioListenersRef } = useAudioContext();

  const drawAll = () => {
    builderFactory!.drawAll(audioBuffer!, audioRef.current!.currentTime);
    reqIdRef.current = requestAnimationFrame(drawAll);
  };

  useEffect(() => {
    if (!canvasInstance || !audioBuffer) return;

    const handlePlay = () => {
      drawAll();
    };

    const handlePause = () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
      reqIdRef.current = null;
    };

    audioListenersRef.current = {
      onPlay: handlePlay,
      onPause: handlePause
    };

    return () => {
      if (reqIdRef.current) {
        cancelAnimationFrame(reqIdRef.current);
      }
    };
  }, [canvasInstance, audioBuffer]);

  return { audioRef };
};

export default useAudioVisualization;
