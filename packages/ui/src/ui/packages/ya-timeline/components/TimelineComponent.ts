// This file describes a class with safe defaults methods
// They do nothing, but have signature which should be visible
// for all child classes
/* eslint-disable @typescript-eslint/no-unused-vars */

import { ReactiveController } from "lit";
import { TimelineCanvasApi } from "../TimelineCanvasApi";
import { YaTimeline } from "../YaTimeline";

export class TimelineComponent implements ReactiveController {
  protected readonly host: YaTimeline;

  protected readonly canvasApi: TimelineCanvasApi;

  public constructor(host: YaTimeline) {
    this.host = host;

    // At the point when components are initialized, canvas API is ready
    this.canvasApi = host.getCanvasApiUnsafe()!;
  }

  public render(_api: TimelineCanvasApi): void {}

  public hostConnected() {}
}
