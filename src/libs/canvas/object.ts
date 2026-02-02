import { FabricObject } from "fabric";
import { pick } from "lodash-es";

export const cloneFabricObject = async (source: FabricObject) => {
  const newObject = await source.clone();
  if (source.subType) {
    newObject.set({ subType: source.subType });
  }
  return newObject;
};

export const getObjectTransformations = (object: FabricObject) => {
  return pick(object, ["left", "top", "scaleX", "scaleY", "flipX", "flipY", "angle"]);
};
