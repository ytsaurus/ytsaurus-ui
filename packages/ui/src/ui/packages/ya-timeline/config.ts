import { MONTH, SECOND } from "./definitions";
import { RegionState } from "./lib/AbstractTimelineDataLoader";
import { EventStatus } from "./components/Events/common";

const defaultPalette = {
  gray1: "#111",
  gray3: "#333",
  gray7: "#777",
  gray13: "#DDD",
  white: "#FFF",
  blue: "#08F",
  blue10: "#8BF",
  green: "#3D5",
  red: "#D30",
  gold: "#F80",
  yellow: "#fe5",
  purple: "#A5A",
};

const body = globalThis.document.body;
const bodyComputedStyle: CSSStyleDeclaration = window.getComputedStyle(body);

export const yaTimelineConfig = {
  ZOOM_MIN: SECOND * 5,
  ZOOM_MAX: MONTH * 2,

  PRIMARY_BACKGROUND_COLOR: defaultPalette.white,

  BOUNDARY_MARK_COLOR: defaultPalette.gray3,
  PRIMARY_MARK_COLOR: defaultPalette.gray7,
  SECONDARY_MARK_COLOR: defaultPalette.gray13,

  CONNECTION_COLOR: defaultPalette.green,

  RULER_FONT: "10px sans-serif",
  RULER_PRIMARY_TEXT_COLOR: defaultPalette.gray1,
  RULER_SECONDARY_TEXT_COLOR: defaultPalette.gray7,
  RULER_TEXT_OUTLINE_COLOR: defaultPalette.white,
  RULER_LABEL_SPACING: 40,
  RULER_GRID_SPACING: 10,
  RULER_SUP_LABEL_POS: 16,
  RULER_LABEL_POS: 33,
  RULER_HEADER_HEIGHT: 41,
  RULER_BORDER_COLOR: defaultPalette.gray3,
  RULER_WEEKEND_COLOR: defaultPalette.red,

  EVENT_HITBOX_PADDING: 2,

  SELECTION_OUTLINE_COLOR: defaultPalette.blue,
  SELECTION_BG_COLOR: defaultPalette.blue,
  SELECTION_OUTLINE_THICKNESS: 5,

  COUNTER_FONT: "12px monospace",
  COUNTER_FONT_CENTER_OFFSET: 4,
  COUNTER_FONT_COLOR: "#111",
  COUNTER_PADDING: 5,

  WHEEL_PAN_SPEED: 0.00025,

  MAX_TRACKS: 5,
  TRACK_HEIGHT: 25,

  OVERLAPPING_THRESHOLD: 8,

  GRID_STROKE_WIDTH: 1,

  eventStatusColors: {
    [EventStatus.INFO]: defaultPalette.blue,
    [EventStatus.QUEUED]: defaultPalette.purple,
    [EventStatus.DEPRECATED]: defaultPalette.gold,
    [EventStatus.OK]: defaultPalette.green,
    [EventStatus.WARNING]: defaultPalette.gold,
    [EventStatus.DANGER]: defaultPalette.red,
    [EventStatus.MUTED]: defaultPalette.gray7,
    [EventStatus.DELETED]: defaultPalette.red,
  },

  groupStatusColors: {
    [EventStatus.INFO]: defaultPalette.blue,
    [EventStatus.QUEUED]: defaultPalette.purple,
    [EventStatus.DEPRECATED]: defaultPalette.gold,
    [EventStatus.OK]: defaultPalette.green,
    [EventStatus.WARNING]: defaultPalette.gold,
    [EventStatus.DANGER]: defaultPalette.red,
    [EventStatus.MUTED]: defaultPalette.gray7,
    [EventStatus.DELETED]: defaultPalette.red,
  },

  regionStateColors: {
    [RegionState.CREATED]: defaultPalette.blue,
    [RegionState.PROCESSING]: defaultPalette.yellow,
    [RegionState.PROCESSED]: defaultPalette.green,
    [RegionState.FAILED]: defaultPalette.red,
  },

  /**
   * Used to resolve CSS values (e.g. colors or fonts) at runtime. Useful for theming.
   *
   * @param {string} value
   */
  resolveCssValue: (value: string): string => {
    if (typeof value !== "string" || !value) return value;

    if (value.startsWith("var(") && value.endsWith(")")) {
      const name = value.substring("var(".length, value.length - ")".length);

      const root = globalThis.document?.documentElement;

      const valueAtDocument = root.style.getPropertyValue(name);
      if (valueAtDocument !== "") {
        return valueAtDocument;
      }

      // Compatibility with nirvana css props (see src/common/theme/utils/computeCssVariable.ts)
      const valueAtBody = bodyComputedStyle.getPropertyValue(name);
      if (valueAtBody !== "") {
        return valueAtBody;
      }

      return name;
    }

    return value;
  },
};
