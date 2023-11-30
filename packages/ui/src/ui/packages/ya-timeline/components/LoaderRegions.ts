import { Region } from "../lib/AbstractTimelineDataLoader";
import { yaTimelineConfig } from "../config";
import { TimelineComponent } from "./TimelineComponent";
import { TimelineCanvasApi } from "../TimelineCanvasApi";

export class LoaderRegions extends TimelineComponent {
  public set regions(regions: Region[]) {
    this._regions = regions;
    this.host.scheduleTimelineRender();
  }

  public get regions(): Region[] {
    return this._regions;
  }

  public render(api: TimelineCanvasApi) {
    api.useStaticTransform();

    const y = yaTimelineConfig.RULER_HEADER_HEIGHT - 2;
    for (const region of this.regions) {
      const x0 = api.timeToPosition(region.time.from);
      const x1 = api.timeToPosition(region.time.to);
      api.ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.regionStateColors[region.state]);
      api.ctx.fillRect(x0, y, x1 - x0, 2);
    }
  }

  public _regions: Region[] = [];
}
