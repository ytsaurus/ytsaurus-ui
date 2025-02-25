/**
 * Converts color to RGBA format with specified opacity
 * @param colorString - color string (formats: #RGB, #RRGGBB, rgb(R,G,B), rgba(R,G,B,A))
 * @param opacity - transparency (0-1)
 * @returns string in rgba(R, G, B, A) format
 */
export const convertToRGBA = (colorString: string, opacity: number): string => {
    // Validate and normalize input data
    if (opacity < 0 || opacity > 1) {
        throw new Error('Opacity must be between 0 and 1');
    }

    let r = 0,
        g = 0,
        b = 0;
    let a = opacity;

    // Remove all whitespace and convert to lowercase
    const normalizedColor = colorString.replace(/\s+/g, '').toLowerCase();

    // Handle HEX format (#RGB or #RRGGBB)
    if (normalizedColor.startsWith('#')) {
        const hex = normalizedColor.substring(1);

        if (hex.length === 3) {
            // #RGB → #RRGGBB
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            // #RRGGBB
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        } else {
            throw new Error('Invalid HEX color format');
        }
    }
    // Handle RGB/RGBA format
    else if (normalizedColor.startsWith('rgb(') || normalizedColor.startsWith('rgba(')) {
        const colorValues = normalizedColor.match(/rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/i);

        if (!colorValues) {
            throw new Error('Invalid RGB/RGBA color format');
        }

        r = parseInt(colorValues[1], 10);
        g = parseInt(colorValues[2], 10);
        b = parseInt(colorValues[3], 10);

        // If original color has transparency, multiply with new opacity
        if (colorValues[4]) {
            a = parseFloat(colorValues[4]) * opacity;
        }
    } else {
        throw new Error('Unsupported color format');
    }

    // Validate color values
    if ([r, g, b].some((v) => v < 0 || v > 255)) {
        throw new Error('Invalid color values (must be 0-255)');
    }

    return `rgba(${r}, ${g}, ${b}, ${a})`;
};
