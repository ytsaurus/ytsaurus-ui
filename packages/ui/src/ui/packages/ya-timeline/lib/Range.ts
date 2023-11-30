import {alignNumber, inexactEqual, rangeToRangeIntersect} from "../../math";

export interface Range<T> {
  contain(range: T): T;
  subtract(...ranges: T[]): T[];
  clone(): T;
  equals(other: T): boolean;
}

export class ContinuousRange implements Range<ContinuousRange> {
  constructor(public from: number, public to: number) {}

  public set(from: number, to: number) {
    this.from = from;
    this.to = to;
    return this;
  }

  public align(step: number) {
    this.from = alignNumber(this.from, step);
    this.to = alignNumber(this.to, step);
    return this;
  }

  public contain(range: ContinuousRange): ContinuousRange {
    return new ContinuousRange(Math.min(this.from, range.from), Math.max(this.to, range.to));
  }

  public subtract(...ranges: ContinuousRange[]): ContinuousRange[] {
    let sources: ContinuousRange[] = [this];

    for (const range of ranges) {
      const tmp = [];

      for (const source of sources) {
        if (rangeToRangeIntersect(source.from, source.to, range.from, range.to)) {
          if (source.from < range.from) {
            tmp.push(new ContinuousRange(source.from, range.from));
          }

          if (source.to > range.to) {
            tmp.push(new ContinuousRange(range.to, source.to));
          }
        } else {
          tmp.push(source);
        }
      }

      sources = tmp;
    }

    return sources.sort((a, b) => a.from - b.from);
  }

  public clone(): ContinuousRange {
    return new ContinuousRange(this.from, this.to);
  }

  public get length(): number {
    return this.to - this.from;
  }

  equals(other: ContinuousRange): boolean {
    return inexactEqual(this.from, other.from, 0.1) && inexactEqual(this.to, other.to, 0.1);
  }
}

export class DiscreteRange<T = unknown> implements Range<DiscreteRange<T>> {
  constructor(public value: { [key: string]: T }) {}

  public set(value: { [key: string]: T }) {
    this.value = value;
  }

  public contain(b: DiscreteRange<T>): DiscreteRange<T> {
    return new DiscreteRange({ ...this.value, ...b.value });
  }

  public subtract(...ranges: DiscreteRange<T>[]): DiscreteRange<T>[] {
    const source = this.clone();

    for (const range of ranges) {
      for (const key in range.value) {
        delete source.value[key];
      }
    }

    return [source as DiscreteRange<T>];
  }

  public difference(range: DiscreteRange<T>): DiscreteRange<T>[] {
    const result = [];

    const left = this.subtract(range)[0];

    if (!left.isEmpty()) {
      result.push(left);
    }

    const right = range.subtract(this)[0];

    if (!right.isEmpty()) {
      result.push(right);
    }

    return result;
  }

  public clone(): DiscreteRange<T> {
    return new DiscreteRange({ ...this.value });
  }

  public equals(other: DiscreteRange<T>): boolean {
    // For the purposes ranges are used for
    // Shallow equality check is sufficient
    const ownKeys = new Set(Object.keys(this.value));
    const otherKeys = Object.keys(other.value);

    if (ownKeys.size !== otherKeys.length) {
      return false;
    }

    for (const key of otherKeys) {
      if (!ownKeys.has(key)) return false;
    }

    return true;
  }

  public isEmpty(): boolean {
    return Object.keys(this.value).length === 0;
  }
}
