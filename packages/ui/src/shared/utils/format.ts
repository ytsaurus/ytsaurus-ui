function defaultKeyToRegex(key: string): RegExp {
    return new RegExp(`{${key}}`, 'g');
}

/**
 * Replaces occurrences of strings like '{key1}', '{key2}'
 * by corresponding values from params, i.e. params['key1'], params['key2']
 * @param template
 * @param params
 * @example formatByParamas('hello {user}', {user: 'world'}); // returns 'hello world'
 */
export function formatByParams(
    template: string,
    params: Record<string, {toString(): string}>,
    {keyToRegex = defaultKeyToRegex}: {keyToRegex?: (k: string) => RegExp} = {},
) {
    return Object.keys(params).reduce((acc, key) => {
        return acc.replace(keyToRegex(key), params[key].toString());
    }, template);
}

/**
 * Replaces occurrences of strings like `"$key1"`, `"$key2"`
 * by corresponding values from params, i.e. `"params['key1']"`, `"params['key2']"`
 * @param template
 * @param params
 * @example formatByParamas('hello {user}', {user: 'world'}); // returns 'hello world'
 */
export function formatByParamsQuotedEnv(
    template: string,
    params: Record<string, {toString(): string}>,
    {sanitizeParams = (v) => v}: {sanitizeParams?: (v: string) => string} = {},
) {
    return Object.keys(params).reduce((acc, key) => {
        const replacement = sanitizeParams(String(params[key]));
        const res = acc.replace(new RegExp(`"\\$${key}"`, 'g'), `"${replacement}"`);
        return res;
    }, template);
}

const DEFAULT_CHARS = {
    '\\': '\\\\',
    '"': '\\"',
};

export function escapeChars(v: string, map: Record<string, string> = DEFAULT_CHARS) {
    let res = '';
    for (let i = 0; i < v.length; ++i) {
        res += map[v[i]] ?? v[i];
    }
    return res;
}
