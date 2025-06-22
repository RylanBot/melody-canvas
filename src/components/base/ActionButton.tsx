import type { Group } from "fabric";
import { Button } from "tdesign-react";

import { useCanvasStore } from "@/stores";

interface ActionButtonProps {
  disabled?: boolean;
  onAdd: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({ disabled, onAdd }) => {
  const { canvasInstance, activeObjects, builderFactory } = useCanvasStore();

  const action =
    activeObjects.length >= 1
      ? {
          theme: "danger" as const,
          icon: "i-ri:subtract-fill",
          text: "Delete",
          onClick: () => {
            activeObjects!.forEach((obj) => {
              canvasInstance!.remove(obj);
              if (obj.subType === "audio") {
                builderFactory!.removeBuilder(obj as Group);
              }
            });
            canvasInstance!.discardActiveObject();
            canvasInstance!.renderAll();
          }
        }
      : {
          theme: "success" as const,
          icon: "i-ri:add-fill",
          text: "New",
          disabled: disabled,
          onClick: onAdd
        };

  return (
    <Button
      shape="round"
      size="small"
      suffix={<div className={action.icon}></div>}
      theme={action.theme}
      {...(action.disabled && { disabled: action.disabled })}
      onClick={action.onClick}
    >
      <span className="font-bold">{action.text}</span>
    </Button>
  );
};

export default ActionButton;
