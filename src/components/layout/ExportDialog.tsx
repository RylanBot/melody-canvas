import { Canvas } from "fabric";
import { useState } from "react";

import { Badge, Button, Dialog, Divider, List } from "tdesign-react";
const { ListItem } = List;

import { AudioClip, Combinator, Log, OffscreenSprite } from "@webav/av-cliper";
Log.setLogLevel(Log.warn); // 隐藏默认 info 日志

import { useMediaBreakpoint } from "@/hooks";
import { useAudioStore, useCanvasStore } from "@/stores";

import { downloadFile, TEMP_CANVAS_KEY } from "@/libs/common";
import { CanvasClip, getAudioBuffer } from "@/libs/media";

import { LoadingOverlay } from "../base";

type ClipTask = {
  id: string;
  blob: Blob | null;
};

const ExportDialog: React.FC = () => {
  const isMobileOrTablet = useMediaBreakpoint("max-lg");

  const { audioFile } = useAudioStore();
  const { canvasInstance, builderFactory } = useCanvasStore();

  const [dialogVisible, setDialogVisible] = useState<boolean>(false);
  const [loadingVisible, setLoadingVisible] = useState<boolean>(false);

  const [clipQueue, setClipQueue] = useState<ClipTask[]>([]);
  const queueIsFull = clipQueue.length >= 3;

  const exportVideo = async () => {
    if (!canvasInstance || !builderFactory || !audioFile) return;
    setLoadingVisible(true);

    canvasInstance.discardActiveObject();

    // 克隆 -> 不影响当前画布
    const lowerCanvas = document.createElement("canvas");
    const newCanvas = new Canvas(lowerCanvas, {
      width: canvasInstance.width,
      height: canvasInstance.height,
      backgroundColor: canvasInstance.backgroundColor
    });
    const factoryCopy = await builderFactory.clone(newCanvas);

    // 临时画布 -> 隐藏绘制
    lowerCanvas.classList.add(TEMP_CANVAS_KEY);
    lowerCanvas.style.display = "none";

    const upperCanvas = newCanvas.upperCanvasEl;
    upperCanvas.classList.add(TEMP_CANVAS_KEY);
    upperCanvas.style.display = "none";

    document.body.appendChild(lowerCanvas);
    document.body.appendChild(upperCanvas);

    const buffer = await getAudioBuffer(audioFile);

    /* 最起码要等 Canvas 与 Audio 克隆完才能关闭弹窗继续编辑 */
    const taskId = `${audioFile.name.split(".")[0]}-${Date.now()}`;
    setClipQueue((prev) => [...prev, { id: taskId, blob: null }]);

    setLoadingVisible(false);

    const canvasClip = new CanvasClip(factoryCopy, buffer);
    const videoSpr = new OffscreenSprite(canvasClip);

    // 视频合成器
    const combinator = new Combinator({
      width: canvasInstance.width,
      height: canvasInstance.height
    });
    await combinator.addSprite(videoSpr, { main: true });

    // 添加音频
    const audioClip = new AudioClip(audioFile.stream());
    const audioSpr = new OffscreenSprite(audioClip);
    await combinator.addSprite(audioSpr);

    // 导出
    const blob = await new Response(combinator.output()).blob();
    setClipQueue((prev) => prev.map((task) => (task.id === taskId ? { ...task, blob } : task)));
    canvasClip.destroy();
  };

  return (
    <>
      <Badge
        className="max-lg:scale-80"
        count={clipQueue.length}
      >
        <Button
          theme="primary"
          variant="outline"
          disabled={!audioFile}
          onClick={() => setDialogVisible(true)}
        >
          <div className="flex-center font-bold">
            <div className="i-ri:folder-video-line mr-4"></div>
            <span>Export Video</span>
          </div>
        </Button>
      </Badge>

      <Dialog
        {...(isMobileOrTablet && { width: "325px" })}
        placement="center"
        confirmBtn={null}
        cancelBtn={null}
        visible={dialogVisible}
        onClose={() => setDialogVisible(false)}
      >
        <p
          className="font-bold"
          dark="text-white"
        >
          {queueIsFull
            ? "The queue is full. Wait until complete or download a file to free up space."
            : "Click the button below to render."}
        </p>

        <p className="my-2">You can close this dialog and continue editing the canvas while it is processing.</p>

        <Button
          className="float-right"
          size="small"
          theme="primary"
          variant="outline"
          disabled={queueIsFull}
          onClick={exportVideo}
        >
          <div className="flex-center font-bold">
            <div className="i-material-symbols:slow-motion-video mr-2"></div>
            <span>Start</span>
          </div>
        </Button>

        {clipQueue.length > 0 && (
          <Divider
            align="center"
            style={{ marginTop: 10 }}
          >
            <strong className="text-emerald-500">Video Queue</strong>
          </Divider>
        )}
        <div>
          <List size="small">
            {clipQueue.map((task) => (
              <ListItem
                key={task.id}
                action={
                  task.blob ? (
                    <div
                      className="text-2xl i-line-md:download-outline-loop cursor-pointer"
                      onClick={() => {
                        downloadFile(task.blob!, `${task.id}.mp4`);
                        setClipQueue((prev) => prev.filter((clip) => clip.id !== task.id));
                      }}
                    ></div>
                  ) : (
                    <div className="text-2xl i-line-md:loading-twotone-loop"></div>
                  )
                }
              >
                {task.id}
              </ListItem>
            ))}
          </List>
        </div>
      </Dialog>

      <LoadingOverlay visible={loadingVisible} />
    </>
  );
};

export default ExportDialog;
