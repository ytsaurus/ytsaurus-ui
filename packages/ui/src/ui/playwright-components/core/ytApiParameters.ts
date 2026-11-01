export interface YTApiParameters {
    path?: string;
    attributes?: string[];
    requests?: Array<{parameters: YTApiParameters}>;
}

export function parseYTApiParameters(
    headers: Record<string, string>,
    body: unknown = {},
): YTApiParameters {
    if (body !== null && typeof body !== 'object') {
        throw new Error('YT API parameters must be an object');
    }
    const encoded = Object.entries(headers)
        .filter(([name]) => name.startsWith('x-yt-parameters-'))
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([, value]) => value)
        .join('');
    return {...(encoded ? JSON.parse(atob(encoded)) : {}), ...body};
}
