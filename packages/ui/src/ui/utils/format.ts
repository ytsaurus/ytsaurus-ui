/**
 * Replaces occurrences of strings like '{key1}', '{key2}'
 * by corresponding values from params, i.e. params['key1'], params['key2']
 * @param template
 * @param params
 * @example formatByParamas('hello {user}', {user: 'world'}); // returns 'hello world'
 */
export function formatByParams(template: string, params: Record<string, {toString(): string}>) {
    return Object.keys(params).reduce((acc, key) => {
        return acc.replace(new RegExp(`{${key}}`, 'g'), params[key].toString());
    }, template);
}

/**
 * Replaces occurrences of strings like `"$key1"`, `"$key2"`
 * by corresponding values from params, i.e. `"params['key1']"`, `"params['key2']"`
 * @param template
 * @param params
 * @example formatByParamas('hello {user}', {user: 'world'}); // returns 'hello world'
 */
export function formatByPramsQuotedEnv(
    template: string,
    params: Record<string, {toString(): string}>,
) {
    return Object.keys(params).reduce((acc, key) => {
        const res = acc.replace(new RegExp(`"\\$${key}"`, 'g'), `"${params[key]}"`);
        return res;
    }, template);
}
