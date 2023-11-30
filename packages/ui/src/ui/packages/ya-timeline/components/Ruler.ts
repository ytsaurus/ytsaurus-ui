import dayjs from "dayjs";
import {clamp, convertDomain} from "../../math";
import {TimelineCanvasApi} from "../TimelineCanvasApi";
import {yaTimelineConfig} from "../config";
import {DAY, HOUR, MINUTE, MONTH, SECOND, YEAR} from "../definitions";
import {TimelineComponent} from "./TimelineComponent";

export class Ruler extends TimelineComponent {
  public height = yaTimelineConfig.RULER_HEADER_HEIGHT;

  public render(api: TimelineCanvasApi): void {
    api.useStaticTransform();

    const { ctx, start, end, canvas, pixelRatio } = api;

    ctx.fillStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.PRIMARY_BACKGROUND_COLOR);
    ctx.fillRect(0, 0, canvas.width, this.height);

    const [top, left, width, height] = [0, 0, ctx.canvas.width / pixelRatio, this.height];

    ctx.font = yaTimelineConfig.RULER_FONT;
    ctx.lineJoin = "miter";
    ctx.miterLimit = 2;
    ctx.lineWidth = 1;

    function timeToPosition(t: number | dayjs.Dayjs) {
      return convertDomain(+t, start, end, 0, width);
    }

    function positionToTime(x: number) {
      return convertDomain(x, left, left + width, start, end);
    }

    function renderLevel(start: number, end: number, supLevel: RulerSupLevel, y: number, color: string) {
      ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_TEXT_OUTLINE_COLOR);

      const t0 = supLevel.start(start);

      let firstRendered = null;

      for (let t = t0; +t < end; t = supLevel.step(t)) {
        const label = dayjs(t).format(supLevel.format);
        const x = timeToPosition(t);

        if (x > 10 && x < width) {
          if (!firstRendered) firstRendered = t;
          ctx.fillStyle = (supLevel.color && supLevel.color(t)) || color;
          ctx.strokeText(label, x, y);
          ctx.fillText(label, x, y);
        }
      }

      const firstLabelTimestamp = positionToTime(10);
      const firstLabel = dayjs(firstLabelTimestamp).format(supLevel.format);
      const firstMark = clamp(
        10,
        -Infinity,
        timeToPosition(firstRendered || end) - ctx.measureText(firstLabel).width - 5
      );
      ctx.fillStyle = (supLevel.color && supLevel.color(firstLabelTimestamp)) || color;
      ctx.strokeText(firstLabel, firstMark, y);
      ctx.fillText(firstLabel, firstMark, y);
    }

    const domain = end - start;

    let level;
    let supLevel;

    for (let i = 0, len = labelLevels.length; i < len; i += 1) {
      if (domain > labelLevels[i].domain) {
        continue;
      }

      let marksWidth = 0;

      for (let t = dayjs(0); +t < domain; t = labelLevels[i].step(t)) {
        const x = convertDomain(+t, 0, domain, left, left + width);
        if (x > 0) marksWidth += yaTimelineConfig.RULER_LABEL_SPACING;
      }

      if (marksWidth > width) {
        continue;
      }

      level = labelLevels[i];
      supLevel = level.sup || labelLevels[i + 1];
      break;
    }

    if (level) {
      renderLevel(
        start,
        end,
        level,
        top + yaTimelineConfig.RULER_LABEL_POS,
        yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_PRIMARY_TEXT_COLOR)
      );
    }

    if (supLevel) {
      renderLevel(
        start,
        end,
        supLevel,
        top + yaTimelineConfig.RULER_SUP_LABEL_POS,
        yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_SECONDARY_TEXT_COLOR)
      );
    }

    ctx.strokeStyle = yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_BORDER_COLOR);
    ctx.beginPath();
    ctx.moveTo(left, top + height + 0.5);
    ctx.lineTo(left + width, top + height + 0.5);
    ctx.stroke();
  }
}

type RulerSupLevel = {
  start: (t: number) => dayjs.Dayjs;
  step: (t: dayjs.Dayjs) => dayjs.Dayjs;
  format: string;
  color?: (t: dayjs.Dayjs | number) => string | null;
};

type RulerLevel = RulerSupLevel & {
  domain: number;
  sup?: RulerSupLevel;
};

const minuteSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("hour");
  },
  step(t) {
    return dayjs(t).add(1, "hour");
  },
  format: "HH",
};

const hourSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("day");
  },
  step(t) {
    return dayjs(t).add(1, "day");
  },
  color(t) {
    const weekday = dayjs(t).day();
    return weekday === 6 || weekday === 0
      ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_WEEKEND_COLOR)
      : null;
  },
  format: "MMM D",
};

const dateSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("month");
  },
  step(t) {
    return dayjs(t).add(1, "month");
  },
  format: "MMM YYYY",
};

const monthSupLabel: RulerSupLevel = {
  start(t) {
    return dayjs(t).startOf("year");
  },
  step(t) {
    return dayjs(t).add(1, "year");
  },
  format: "YYYY",
};

const labelLevels: RulerLevel[] = [
  {
    domain: SECOND,
    start: (t) => dayjs(t).startOf("millisecond"),
    step: (t) => dayjs(t).add(1, "millisecond"),
    format: "SSS[ms]",
    sup: {
      start(t) {
        return dayjs(t).startOf("second");
      },
      step(t) {
        return dayjs(t).add(1, "second");
      },
      format: "ss[′′]",
    },
  },
  {
    domain: MINUTE,
    start: (t) => dayjs(t).startOf("second"),
    step: (t) => dayjs(t).add(1, "second"),
    format: "ss[′′]",
    sup: {
      start(t) {
        const time = dayjs(t).startOf("minute");
        return time.subtract(time.minute() % 5, "minute");
      },
      step(t) {
        return dayjs(t).add(5, "minute");
      },
      format: "mm[′]",
    },
  },
  {
    domain: HOUR,
    start(t) {
      const time = dayjs(t).startOf("minute");
      return time.subtract(time.minute() % 5, "minute");
    },
    step: (t) => dayjs(t).add(5, "minute"),
    format: "mm[′]",
    sup: minuteSupLabel,
  },
  {
    domain: DAY,
    start(t) {
      const time = dayjs(t).startOf("minute");
      return time.subtract(time.minute() % 15, "minute");
    },
    step: (t) => dayjs(t).add(15, "minute"),
    format: "mm[′]",
    sup: minuteSupLabel,
  },
  {
    domain: DAY,
    start: (t) => dayjs(t).startOf("hour"),
    step: (t) => dayjs(t).add(1, "hour"),
    format: "HH",
    sup: hourSupLabel,
  },
  {
    domain: MONTH,
    start(t) {
      const time = dayjs(t).startOf("hour");
      return time.subtract(time.hour() % 4, "hour");
    },
    step: (t) => dayjs(t).add(4, "hour"),
    format: "HH",
    sup: hourSupLabel,
  },
  {
    domain: MONTH,
    start: (t) => dayjs(t).startOf("day"),
    step: (t) => dayjs(t).add(1, "day"),
    color(t) {
      const weekday = dayjs(t).day();
      return weekday === 6 || weekday === 0
        ? yaTimelineConfig.resolveCssValue(yaTimelineConfig.RULER_WEEKEND_COLOR)
        : null;
    },
    format: "D",
    sup: dateSupLabel,
  },
  {
    domain: MONTH * 6,
    start: (t) => dayjs(t).startOf("week").add(1, "day"),
    step: (t) => dayjs(t).add(1, "week"),
    format: "D",
  },
  {
    domain: YEAR,
    start: (t) => dayjs(t).startOf("month"),
    step: (t) => dayjs(t).add(1, "month"),
    format: "MMM",
    sup: monthSupLabel,
  },
  {
    domain: YEAR * 10,
    start(t) {
      const time = dayjs(t).startOf("month");
      return time.subtract(time.month() % 3, "month");
    },
    step: (t) => dayjs(t).add(3, "month"),
    format: "[Q]Q",
  },
  {
    domain: Infinity,
    start: (t) => dayjs(t).startOf("year"),
    step: (t) => dayjs(t).add(1, "year"),
    format: "YYYY",
  },
];
