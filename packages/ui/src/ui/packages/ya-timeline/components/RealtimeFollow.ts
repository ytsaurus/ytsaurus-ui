import { TimelineComponent } from "./TimelineComponent";
import { YaTimeline } from "../YaTimeline";

export class RealtimeFollow extends TimelineComponent {
  public set updateInterval(ms: number) {
    this._updateInterval = ms;
  }

  public get updateInterval(): number {
    return this._updateInterval;
  }

  constructor(host: YaTimeline, initialIntervalMs = -1) {
    super(host);
    this._updateInterval = initialIntervalMs;
  }

  public hostConnected() {
    if (this._updateInterval > 0) {
      this.start();
    }
  }

  public start() {
    this.followTimerId = window.setInterval(this.updateBounds, this._updateInterval);
  }

  public hostDisconnected() {
    if (typeof this.followTimerId === "number") {
      window.clearInterval(this.followTimerId);
    }
  }

  protected followTimerId: number | undefined;

  protected _updateInterval = 0;

  protected updateBounds = () => {
    const api = this.canvasApi;
    const currentTime = Date.now();
    api.notifyBoundsChanged(currentTime - (api.end - api.start), currentTime);
  };
}
