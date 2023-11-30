export const SECOND = 1000;
export const MINUTE = SECOND * 60;
export const HOUR = MINUTE * 60;
export const DAY = HOUR * 24;
export const WEEK = DAY * 7;
export const MONTH = DAY * 30;
export const YEAR = DAY * 365;

export type TimelineState = {
  start: number;
  end: number;
  viewportWidth: number;
};

export type UnixTimestampMs = number;

export type Constructor<T> = {
  // eslint-disable-next-line
  new (...args: any[]): T;
};
