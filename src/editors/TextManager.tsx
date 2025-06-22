import { FabricText, Textbox } from "fabric";
import { useEffect, useMemo, useState } from "react";

import type { ColorObject, ColorPickerChangeTrigger } from "tdesign-react";
import { Checkbox, ColorPicker, SelectInput, Textarea } from "tdesign-react";

import { useCanvasStore } from "@/stores";

import { createGradient, GRADIENT_PRESET } from "@/libs/canvas";
import { INPUT_STYLE, pickWithDefaults } from "@/libs/common";

import { ActionButton, OptionCard } from "@/components/base";

import { AVAILABLE_FONTS, DEFAULT_TEXT, OBJECT_CONFIG } from "./props";
import type { TextOptions } from "./types";

const TextManager: React.FC = () => {
  const { canvasInstance, activeObjects } = useCanvasStore();

  const [text, setText] = useState<string>("");
  const [textOptions, setTextOptions] = useState<TextOptions>(DEFAULT_TEXT);
  const [popupVisible, setPopupVisible] = useState(false);

  const resetOptions = () => {
    setText("");
    setTextOptions(DEFAULT_TEXT);
  };

  const activeTextList = useMemo(() => {
    return activeObjects.filter((obj) => obj?.subType === "text") as Textbox[];
  }, [activeObjects]);

  useEffect(() => {
    if (activeTextList.length > 0) {
      const firstText = activeTextList[0];
      const textInput = firstText.text;
      const textData = pickWithDefaults(firstText as Partial<TextOptions>, DEFAULT_TEXT);

      setText(textInput);
      setTextOptions(textData);
    } else {
      resetOptions();
    }
  }, [activeTextList]);

  const updateText = (text: string) => {
    setText(text);
    activeTextList.forEach((textObj) => {
      textObj.set({ text });
    });
    canvasInstance?.renderAll();
  };

  const updateColor = (
    colorVal: string,
    context: {
      color: ColorObject;
      trigger: ColorPickerChangeTrigger;
    }
  ) => {
    const isGradient = context.color?.isGradient;
    const color = isGradient ? context.color.css : colorVal;

    updateTextOptions({ color });

    activeTextList.forEach((textObj) => {
      const fill = isGradient ? createGradient(color, textObj.width, textObj.height) : colorVal;
      textObj.set({ fill });
    });
    canvasInstance?.renderAll();
  };

  const updateTextOptions = (options: Partial<TextOptions>) => {
    setTextOptions((prev) => {
      const updatedOptions = { ...prev, ...options };

      activeTextList.forEach((textObj) => {
        textObj.set(updatedOptions);
      });
      canvasInstance?.renderAll();

      return updatedOptions;
    });
  };

  const getMaxLineWidth = (text: string) => {
    const lines = text.split("\n");
    const widths = lines.map((line) => {
      const textObj = new FabricText(line, { ...OBJECT_CONFIG, ...textOptions });
      return textObj.calcTextWidth();
    });
    return Math.max(...widths);
  };

  const handleAddText = () => {
    if (!canvasInstance || text === "") return;

    const textbox = new Textbox(text, {
      ...OBJECT_CONFIG,
      ...textOptions,
      subType: "text",
      width: getMaxLineWidth(text) // 手动设置宽度 -> 防止初始化换行
    });

    // 处理渐变
    const isGradient = textOptions.color.includes("gradient");
    const fill = isGradient ? createGradient(textOptions.color, textbox.width, textbox.height) : textOptions.color;
    textbox.set({ fill });

    // 禁止变形拉伸
    textbox.setControlsVisibility({
      mt: false,
      mb: false
    });

    canvasInstance.add(textbox);
    canvasInstance.setActiveObject(textbox);
    canvasInstance.renderAll();

    resetOptions();
  };

  return (
    <>
      <div className="mb-6">
        <div
          className="flex-between font-bold text-emerald-600 mb-4"
          dark="text-emerald-400"
        >
          <div>Content</div>
          <ActionButton
            disabled={text === ""}
            onAdd={handleAddText}
          />
        </div>
        {/* 文本 */}
        <Textarea
          placeholder="Input something..."
          disabled={activeTextList.length > 1}
          value={text}
          onChange={(val) => updateText(val)}
        />
      </div>

      <div className="mb-6">
        <div
          className="font-bold text-base text-emerald-600 mb-3"
          dark="text-emerald-400"
        >
          Options
        </div>
        <div className="space-y-6">
          {/* 颜色 */}
          <OptionCard title="Color">
            <ColorPicker
              key={activeTextList.toString()}
              format="CSS"
              recentColors={null}
              swatchColors={GRADIENT_PRESET}
              inputProps={{ style: INPUT_STYLE }}
              value={textOptions.color}
              onChange={updateColor}
            />
          </OptionCard>

          {/* 样式 */}
          <OptionCard title="Style">
            <Checkbox
              checked={textOptions.fontWeight === 900}
              onChange={(checked) => updateTextOptions({ fontWeight: checked ? 900 : 400 })}
            >
              <span className="font-bold">Bold</span>
            </Checkbox>
            <Checkbox
              checked={textOptions.fontStyle === "italic"}
              onChange={(checked) => updateTextOptions({ fontStyle: checked ? "italic" : "normal" })}
            >
              <span className="italic">Italic</span>
            </Checkbox>
          </OptionCard>

          {/* 字体 */}
          <OptionCard title="Font">
            <SelectInput
              allowInput
              clearable
              placeholder="Select or Input"
              style={INPUT_STYLE}
              value={textOptions.fontFamily}
              popupVisible={popupVisible}
              onInputChange={(font) => updateTextOptions({ fontFamily: font })}
              onPopupVisibleChange={(visible) => setPopupVisible(visible)}
              panel={
                <ul>
                  {AVAILABLE_FONTS.map((font) => (
                    <li
                      key={font}
                      className="text-xs cursor-pointer p-1 rounded-md hover:bg-emerald-50"
                      dark="hover:bg-dark-800"
                      style={{ fontFamily: font }}
                      onClick={() => {
                        updateTextOptions({ fontFamily: font });
                        setPopupVisible(false);
                      }}
                    >
                      {font}
                    </li>
                  ))}
                </ul>
              }
            />
          </OptionCard>
        </div>
      </div>
    </>
  );
};

export default TextManager;
