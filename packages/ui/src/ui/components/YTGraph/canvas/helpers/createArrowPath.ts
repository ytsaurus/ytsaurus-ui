export const createArrowPath = (
    start: {x: number; y: number},
    end: {x: number; y: number},
    height: number,
    width: number,
): Path2D => {
    const path = new Path2D();

    // Calculate direction vector
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const length = Math.sqrt(dx * dx + dy * dy);

    if (length === 0) {
        return path;
    }

    // Normalize direction
    const unitX = dx / length;
    const unitY = dy / length;

    // Perpendicular vector
    const perpX = -unitY;
    const perpY = unitX;

    // Arrow tip at end point
    const tipX = end.x;
    const tipY = end.y;

    // Base of the arrow (moved back by height)
    const baseX = end.x - unitX * height;
    const baseY = end.y - unitY * height;

    // Two corners of the arrow base
    const halfWidth = width / 2;
    const corner1X = baseX + perpX * halfWidth;
    const corner1Y = baseY + perpY * halfWidth;
    const corner2X = baseX - perpX * halfWidth;
    const corner2Y = baseY - perpY * halfWidth;

    path.moveTo(tipX, tipY);
    path.lineTo(corner1X, corner1Y);
    path.lineTo(corner2X, corner2Y);
    path.closePath();

    return path;
};
