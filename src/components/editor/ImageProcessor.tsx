import { FabricImage, FabricObjectProps, Path, Shadow } from "fabric";
import React, { useEffect, useMemo, useState } from "react";
import { ColorPicker, InputNumber, Upload, type UploadFile } from "tdesign-react";

import { useDynamicCss } from "@/hooks";
import { useCanvasStore } from "@/stores";

import { createPathByRadius, extractRadiusFromPath, getObjectTransformations } from "@/libs/canvas";
import { pickWithDefaults } from "@/libs/common";

import { ActionButton, OptionCard } from "../base";
import { DEFAULT_RADIUS, DEFAULT_SHADOW, OBJECT_CONFIG, RADIUS_INPUT } from "./props";
import type { RadiusOptions, ShadowOptions } from "./types";

const ImageProcessor: React.FC = () => {
  const { canvasInstance, activeObjects } = useCanvasStore();

  const [imageFile, setImageFile] = useState<UploadFile | null>(null);

  const [radiusOptions, setRadiusOptions] = useState<RadiusOptions>(DEFAULT_RADIUS);
  const [shadowOptions, setShadowOptions] = useState<ShadowOptions>(DEFAULT_SHADOW);

  const resetOptions = () => {
    setImageFile(null);
    setRadiusOptions(DEFAULT_RADIUS);
    setShadowOptions(DEFAULT_SHADOW);
  };

  const activeImage = useMemo(() => {
    const obj = activeObjects[0];
    if (obj?.subType === "image") {
      return obj as FabricImage;
    } else {
      resetOptions();
      return null;
    }
  }, [activeObjects]);

  // 选中状态下隐藏 Upload 组件原有的删除按钮 -> 交给 Trigger 处理
  useDynamicCss(
    `
      .t-upload__card-mask-item {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
  
      .t-upload__card-mask-item-divider {
        display: none;
      }
  
      .t-upload__card-mask-item-divider ~ * {
        display: none;
      }
    `,
    !activeImage
  );

  const ImgPreviewTrigger: React.FC = () => {
    return (
      <label className="w-full h-full flex-center">
        <div className="i-tdesign-refresh text-base"></div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={updateImageFile}
        />
      </label>
    );
  };

  useEffect(() => {
    if (activeImage) {
      // 展示选中物体的参数
      const imageUrl = activeImage.getSrc();
      setImageFile({ url: imageUrl });

      const shadowData = pickWithDefaults(activeImage.shadow as Partial<ShadowOptions>, DEFAULT_SHADOW);
      setShadowOptions(shadowData);

      const radiusData = extractRadiusFromPath(
        (activeImage.clipPath as Path).path,
        activeImage.width,
        activeImage.height
      );
      setRadiusOptions(radiusData);
    }
  }, [activeImage]);

  const createFabricImg = async (url: string, options?: Partial<FabricObjectProps>) => {
    const image = await FabricImage.fromURL(url);
    const width = image.width;
    const height = image.height;
    const scaleFactor = 200 / height;

    image.set({ ...OBJECT_CONFIG, subType: "image" });
    image.scale(scaleFactor);

    // 阴影
    image.set({ shadow: new Shadow(shadowOptions) });

    // 圆角
    const roundedPath = createPathByRadius(width, height, radiusOptions);
    image.set({ clipPath: roundedPath });

    if (options) {
      image.set(options);
    }

    canvasInstance!.add(image);
    canvasInstance!.setActiveObject(image);
    canvasInstance!.renderAll();
  };

  const updateImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImageFile({ url: imageUrl });

    const origProps = getObjectTransformations(activeImage!);
    await createFabricImg(imageUrl, origProps);

    canvasInstance!.remove(activeImage!);
  };

  const updateRadius = (options: Partial<RadiusOptions>) => {
    setRadiusOptions((prev) => {
      const updatedOptions = { ...prev, ...options };

      if (activeImage) {
        const roundedPath = createPathByRadius(activeImage.width, activeImage.height, updatedOptions);
        activeImage.set({ clipPath: roundedPath });
        canvasInstance!.renderAll();
      }

      return updatedOptions;
    });
  };

  const updateShadow = (options: Partial<ShadowOptions>) => {
    setShadowOptions((prev) => {
      const updatedOptions = { ...prev, ...options };

      if (activeImage) {
        activeImage.set({ shadow: new Shadow(updatedOptions) });
        canvasInstance!.renderAll();
      }

      return updatedOptions;
    });
  };

  const handleAddImage = async () => {
    if (!canvasInstance || !imageFile) return;

    const file = imageFile.raw!;
    const imageUrl = URL.createObjectURL(file);
    await createFabricImg(imageUrl);
  };

  return (
    <>
      <div className="mb-6">
        <div className="flex-between font-bold text-emerald-600 dark:text-emerald-400 mb-4">
          <div>File</div>
          <ActionButton
            activeObj={activeImage}
            disabled={!imageFile}
            onAdd={handleAddImage}
          />
        </div>
        <Upload
          className="h-28"
          theme="image"
          accept="image/*"
          multiple={false}
          autoUpload={false}
          showImageFileName={false}
          files={imageFile ? [imageFile] : []}
          onChange={(files) => setImageFile(files[0])}
          {...(activeImage ? { imageViewerProps: { trigger: <ImgPreviewTrigger /> } } : {})}
        />
      </div>

      <div className="mb-6">
        <div className="font-bold text-emerald-600 dark:text-emerald-400 mb-3">Options</div>
        <div className="space-y-6">
          {/* 阴影 */}
          <OptionCard
            vertical
            title="Shadow"
          >
            <div className="grid grid-cols-2 gap-2">
              <ColorPicker
                format="HEX"
                colorModes={["monochrome"]}
                recentColors={null}
                swatchColors={null}
                inputProps={{ style: { width: "88px" } }}
                value={shadowOptions.color}
                onChange={(val) => updateShadow({ color: val })}
              />
              <InputNumber
                size="small"
                theme="column"
                min={0}
                label={<div className={"i-material-symbols:blur-circular-outline"}></div>}
                value={shadowOptions.blur}
                onChange={(val) => updateShadow({ blur: Number(val) })}
              />
              <InputNumber
                size="small"
                theme="column"
                min={0}
                label={<div className={"i-tabler:letter-x"}></div>}
                value={shadowOptions.offsetX}
                onChange={(val) => updateShadow({ offsetX: Number(val) })}
              />
              <InputNumber
                size="small"
                theme="column"
                min={0}
                label={<div className={"i-tabler:letter-y"}></div>}
                value={shadowOptions.offsetY}
                onChange={(val) => updateShadow({ offsetY: Number(val) })}
              />
            </div>
          </OptionCard>

          {/* 弧度 */}
          <OptionCard
            vertical
            title="Rounded Corner"
          >
            <div className="grid grid-cols-2 gap-2">
              {RADIUS_INPUT.map(({ key, icon }) => (
                <InputNumber
                  key={key}
                  size="small"
                  theme="column"
                  min={0}
                  label={<div className={icon}></div>}
                  value={radiusOptions[key as keyof RadiusOptions]}
                  onChange={(val) => updateRadius({ [key]: val })}
                />
              ))}
            </div>
          </OptionCard>
        </div>
      </div>
    </>
  );
};

export default ImageProcessor;
