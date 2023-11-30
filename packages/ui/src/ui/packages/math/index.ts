export function isPointInRect(
  px: number,
  py: number,
  left: number,
  top: number,
  width: number,
  height: number
): boolean {
  return px >= left && px <= left + width && py >= top && py <= top + height;
}

export function pointToRangeIntersect(point: number, x0: number, x1: number): boolean {
  return point >= x0 && point <= x1;
}

export function rangeToRangeIntersect(a0: number, a1: number, b0: number, b1: number): boolean {
  return a1 - a0 > b1 - b0
    ? pointToRangeIntersect(b0, a0, a1) || pointToRangeIntersect(b1, a0, a1)
    : pointToRangeIntersect(a0, b0, b1) || pointToRangeIntersect(a1, b0, b1);
}

/**
 * Checks if a contains b
 *
 */
export function isRangeContained(a0: number, a1: number, b0: number, b1: number) {
  return pointToRangeIntersect(b0, a0, a1) && pointToRangeIntersect(b1, a0, a1);
}

/**
 * Checks intersection of two axis-aligned bounding boxes.
 *
 */
export function aabbToAabbIntersect(
  left1: number,
  top1: number,
  right1: number,
  bottom1: number,
  left2: number,
  top2: number,
  right2: number,
  bottom2: number
): boolean {
  return rangeToRangeIntersect(left1, right1, left2, right2) && rangeToRangeIntersect(top1, bottom1, top2, bottom2);
}

export function getRatio(value: number, x0: number, x1: number): number {
  const domain = Math.abs(x1 - x0);
  return x0 < x1 ? (value - x0) / domain : (value - x1) / domain;
}

export function getClampedRatio(value: number, x0: number, x1: number): number {
  return clamp(getRatio(value, x0, x1), 0, 1);
}

export function convertDomain(
  value: number,
  src0: number,
  src1: number,
  dst0: number,
  dst1: number,
  fn: (x: number) => number = (x) => x
): number {
  const dstDomain = Math.abs(dst1 - dst0);
  const ratio = getRatio(value, src0, src1);
  return dst0 < dst1 ? dst0 + fn(ratio) * dstDomain : dst1 + fn(1 - ratio) * dstDomain;
}

export function clamp(value: number, min: number, max: number): number {
  // if operators are faster than Math.min/max

  if (value > max) {
    return max;
  }
  if (value < min) {
    return min;
  }

  return value;
}

export function alignNumber(value: number, step: number): number {
  return value - (value % step);
}

export function inexactEqual(value: number, target: number, epsilon = 0.01): boolean {
  return value >= target - epsilon && value <= target + epsilon;
}
