import findIndex_ from 'lodash/findIndex';

export function parseBytes(input: string): number {
    const names = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
    const formatRegex = new RegExp('^((\\d*[.])?\\d+)( *[' + names.join('') + '])(iB)?(/s)?$', 'i');

    if (formatRegex.test(input)) {
        const match = input.match(formatRegex)!;
        const value = match[1];
        const dimension = match[3].trim();
        const dimensionIndex = findIndex_(
            names,
            (name) => name.toUpperCase() === dimension.toUpperCase(),
        );

        return Math.floor(Number(value) * Math.pow(2, 10 * dimensionIndex));
    } else {
        return Math.floor(Number(input));
    }
}
