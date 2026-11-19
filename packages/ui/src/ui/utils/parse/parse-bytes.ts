function getBytesSuffixIndex(suffix: string): number {
    const normalized = suffix.toLowerCase();
    const suffixes = [
        ['b', 'б'],
        ['k', 'kib', 'к', 'киб'],
        ['m', 'mib', 'м', 'миб'],
        ['g', 'gib', 'г', 'гиб'],
        ['t', 'tib', 'т', 'тиб'],
        ['p', 'pib', 'п', 'пиб'],
        ['e', 'eib', 'э', 'эиб'],
    ];

    return suffixes.findIndex((names) => names.includes(normalized));
}

export function parseBytes(input: string): number {
    const match = input.match(/^(\d*\.?\d+) *([a-zа-я]+)$/i);

    if (match) {
        const suffixIndex = getBytesSuffixIndex(match[2]);
        if (suffixIndex !== -1) {
            return Math.floor(Number(match[1]) * Math.pow(2, 10 * suffixIndex));
        }
    }

    return Math.floor(Number(input));
}
