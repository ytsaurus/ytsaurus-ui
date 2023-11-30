import {alignNumber, convertDomain} from "../math";
import {YaTimeline} from "./YaTimeline";
import {TimelineComponent} from "./components/TimelineComponent";
import {yaTimelineConfig} from "./config";
import {Constructor, SECOND} from "./definitions";

export class TimelineCanvasApi {
  public constructor(options: {
    timeline: YaTimeline;
    notifyBoundsChanged: (start: number, end: number) => void;
    notifyScrollTopChanged: (scrollTop: number) => void;
  }) {
    Object.assign(this, options);

    this.canvas = options.timeline.renderRoot.querySelector("canvas")!;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.globalAlpha = 1.0;
  }

  public readonly canvas: HTMLCanvasElement;

  public readonly ctx: CanvasRenderingContext2D;

  public get pixelRatio(): number {
    return window.devicePixelRatio || 1;
  }

  public get canvasScrollTop(): number {
    return this.timeline.canvasScrollTop || 0;
  }

  public get start(): number {
    return this.timeline.start;
  }

  public get end(): number {
    return this.timeline.end;
  }

  public get width(): number {
    return this.canvas.width / this.pixelRatio;
  }

  public get height(): number {
    return this.canvas.height / this.pixelRatio;
  }

  public get currentTime(): number {
    return alignNumber(Date.now(), SECOND);
  }

  public timeToPosition(t: number): number {
    const actualWidth = this.width;
    return convertDomain(t, this.timeline.start, this.timeline.end, 0, actualWidth) || 0;
  }

  public positionToTime(px: number): number {
    return convertDomain(px, 0, this.width, this.timeline.start, this.timeline.end);
  }

  public widthToTime(px: number): number {
    return this.positionToTime(px) - this.start;
  }

  public clear(): void {
    this.ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_BACKGROUND_COLOR);
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  public useStaticTransform(): void {
    const dpr = this.pixelRatio;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  public useScrollTransform(): void {
    const dpr = this.pixelRatio;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, -this.canvasScrollTop * dpr);
  }

  public getComponent<T extends TimelineComponent>(componentConstructor: Constructor<T>): T | undefined {
    return this.timeline.getComponentUnsafe(componentConstructor);
  }

  public readonly notifyBoundsChanged!: (start: number, end: number) => void;

  public readonly notifyScrollTopChanged!: (scrollTop: number) => void;

  protected readonly timeline!: YaTimeline;
}
