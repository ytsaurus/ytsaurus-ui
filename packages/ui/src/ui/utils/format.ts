/**
 * Replaces occurrences of strings like '{key1}', '{key2}'
 * by corresponding values from params, i.e. params['key1'], params['key2']
 * @param template
 * @param params
 * @example formatByParamas('hello {user}', {user: 'world'}); // returns 'hello world'
 */
export function formatByParams(template: string, params: Record<string, unknown>) {
    return Object.keys(params).reduce((acc, key) => {
        return acc.replace(new RegExp(`{${key}}`, 'g'), String(params[key]));
    }, template);
}
