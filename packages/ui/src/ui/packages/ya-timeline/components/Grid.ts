import dayjs from "dayjs";
import {convertDomain} from "../../math";

import {TimelineCanvasApi} from "../TimelineCanvasApi";
import {yaTimelineConfig} from "../config";
import {DAY, HOUR, MONTH, YEAR} from "../definitions";
import {Ruler} from "./Ruler";
import {TimelineComponent} from "./TimelineComponent";

export class Grid extends TimelineComponent {
  public render(api: TimelineCanvasApi) {
    const rulerHeight = api.getComponent(Ruler)?.height || 0;
    const { canvas, start, end, pixelRatio } = api;
    const left = 0;
    const top = rulerHeight;
    const width = canvas.width / pixelRatio;
    const height = canvas.height - rulerHeight;
    const domain = end - start;

    let level: TGridLevel;

    for (let i = 0, len = gridLevels.length; i < len; i += 1) {
      if (domain > gridLevels[i].domain) {
        continue;
      }

      let marksWidth = 0;

      for (let t = dayjs(0); +t < domain; t = gridLevels[i].step(t)) {
        const x = convertDomain(+t, 0, domain, left, left + width);
        if (x > 0) {
          marksWidth += yaTimelineConfig.RULER_GRID_SPACING;
        }
      }

      if (marksWidth > width + 40) {
        continue;
      }

      level = gridLevels[i];
      break;
    }

    api.useStaticTransform();

    api.ctx.lineJoin = "miter";
    api.ctx.miterLimit = 2;
    api.ctx.lineWidth = 1;

    this.renderLevel(api.ctx, top, left, width, height, start, end, level!);
  }

  private renderLevel(
    ctx: CanvasRenderingContext2D,
    top: number,
    left: number,
    width: number,
    height: number,
    start: number,
    end: number,
    level: TGridLevel
  ) {
    ctx.lineWidth = yaTimelineConfig.GRID_STROKE_WIDTH;
    for (let t = level.start(start); +t < end; t = level.step(t)) {
      const x = Math.floor(convertDomain(+t, start, end, left, left + width));
      ctx.beginPath();
      ctx.strokeStyle = level.style(t);
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
      ctx.stroke();
    }
  }
}

function primaryForEvery(n: number, unit: "second" | "minute" | "month" | "year") {
  return (t: dayjs.Dayjs) => {
    return t[unit]() % n === 0
      ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
      : yaTimelineConfig.resolveCssValue(yaTimelineConfig.SECONDARY_MARK_COLOR);
  };
}

type TGridLevel = {
  domain: number;
  style: (t: dayjs.Dayjs) => string;
  start: (t: dayjs.Dayjs | number) => dayjs.Dayjs;
  step: (t: dayjs.Dayjs) => dayjs.Dayjs;
};

const gridLevels: TGridLevel[] = [
  {
    domain: HOUR,
    style: primaryForEvery(5, "minute"),
    start: (t) => dayjs(t).startOf("minute"),
    step: (t) => t.add(1, "minute"),
  },
  {
    domain: DAY,
    style(t) {
      if (t.hour() === 0 && t.minute() === 0) {
        return yaTimelineConfig.resolveCssValue(yaTimelineConfig.BOUNDARY_MARK_COLOR);
      }

      return t.minute() % 4 === 0
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
        : yaTimelineConfig.resolveCssValue(yaTimelineConfig.SECONDARY_MARK_COLOR);
    },
    start(t) {
      const time = dayjs(t).startOf("minute");
      return time.subtract(time.minute() % 15, "minute");
    },
    step: (t) => t.add(15, "minute"),
  },
  {
    domain: MONTH,
    style(t) {
      if (t.hour() === 0) {
        return yaTimelineConfig.resolveCssValue(yaTimelineConfig.BOUNDARY_MARK_COLOR);
      }

      return t.hour() % 4 === 0
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
        : yaTimelineConfig.resolveCssValue(yaTimelineConfig.SECONDARY_MARK_COLOR);
    },
    start: (t) => dayjs(t).startOf("hour"),
    step: (t) => t.add(1, "hour"),
  },
  {
    domain: YEAR,
    style(t) {
      if (t.date() === 1) {
        return yaTimelineConfig.resolveCssValue(yaTimelineConfig.BOUNDARY_MARK_COLOR);
      }

      return t.day() === 1
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR)
        : yaTimelineConfig.resolveCssValue(yaTimelineConfig.SECONDARY_MARK_COLOR);
    },
    start: (t) => dayjs(t).startOf("day"),
    step: (t) => t.add(1, "day"),
  },
  {
    domain: YEAR * 5,
    style: primaryForEvery(3, "month"),
    start: (t) => dayjs(t).startOf("month"),
    step: (t) => dayjs(t).add(1, "month"),
  },
  {
    domain: Infinity,
    style() {
      return yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_MARK_COLOR);
    },
    start: (t) => dayjs(t).startOf("year"),
    step: (t) => t.add(1, "year"),
  },
];
