import { FabricObject, Group } from "fabric";
import { cloneDeep } from "lodash-es";

import { createGradientMap, getObjectTransformations } from "@/libs/canvas";
import FrequencyAnalyzer from "./FrequencyAnalyzer";

/**
 * 构造各种可视化元素
 * - 负责直接操作 `Group`
 * - 通用方法放在此类
 * - 具体实现放在子类
 */
abstract class Builder {
  public abstract get name(): string;
  protected id: string;

  protected count: number;

  protected color: string; // Hex or CSS linear-gradient
  protected colorMap: string[]; // 用于渐变色

  protected group = new Group();

  protected analyzer: FrequencyAnalyzer;
  protected shape: string;

  constructor(count: number, color: string, shape: string) {
    this.id = this.generateId();

    this.count = count;

    this.color = color;
    this.colorMap = this.generateColorMap();

    this.analyzer = new FrequencyAnalyzer(count * 2);
    this.shape = shape;
  }

  public clone() {
    const builder = cloneDeep(this);
    builder.updateId();
    return builder;
  }

  private generateId() {
    return `${this.name}-${new Date().getTime()}`;
  }

  protected generateColorMap() {
    if (!this.color.includes("gradient")) {
      return new Array(this.count).fill(this.color);
    } else {
      return createGradientMap(this.color, this.count);
    }
  }

  public getId() {
    return this.id;
  }

  public updateId() {
    const newId = this.generateId();
    this.id = newId;
    this.group.set({ id: newId });
  }

  public getCount() {
    return this.count;
  }

  public updateCount(count: number) {
    if (!this.group.canvas) return;

    this.count = count;
    this.colorMap = this.generateColorMap();

    this.analyzer.updateFFTSize(count * 2);

    const origProps = getObjectTransformations(this.group);

    const scaledWidth = this.group.width * origProps.scaleX;
    const scaledHeight = this.group.height * origProps.scaleY;
    const elements = this.createElements(scaledWidth, scaledHeight);

    this.group.remove(...this.group.getObjects());
    this.group.add(...elements);

    this.group.set(origProps);
    this.group.setCoords();
  }

  public getColor() {
    return this.color;
  }

  public updateColor(color: string) {
    this.color = color;
    this.colorMap = this.generateColorMap();

    this.group.getObjects().forEach((obj, index) => {
      obj.set({ fill: this.colorMap[index] });
    });
  }

  public getGroup() {
    return this.group;
  }

  public updateGroup(group: Group) {
    this.group = group;
  }

  public getShape() {
    return this.shape;
  }

  public updateShape(shape: string) {
    this.shape = shape;
  }

  public prepareDraw(buffer: AudioBuffer, time: number) {
    const frequency = this.analyzer?.getFrequency(buffer, time, this.shape);
    if (!frequency) return;

    this.draw(frequency);
  }

  protected abstract createElements(groupWidth: number, groupHeight: number): FabricObject[];
  public abstract init(canvasWidth: number, canvasHeight: number): void;
  protected abstract draw(frequency: number[]): void;
}

export default Builder;
