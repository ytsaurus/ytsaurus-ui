export const getRandomColor = (seed: number): string => {
    const random = (): number => {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };

    const r = Math.floor(random() * 256);
    const g = Math.floor(random() * 256);
    const b = Math.floor(random() * 256);

    const toHex = (c: number): string => {
        const hex = c.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
