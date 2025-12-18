const userAgent = typeof navigator === 'object' ? navigator.userAgent : '';
export const isWindows = userAgent.indexOf('Windows') >= 0;
export const isMacintosh = userAgent.indexOf('Macintosh') >= 0;
export const isLinux = userAgent.indexOf('Linux') >= 0;

export type CommandKey = 'meta' | 'ctrl';

export function getControlCommandKey(): CommandKey {
    return isMacintosh ? 'meta' : 'ctrl';
}

export function checkControlCommandKey(
    event: MouseEvent | KeyboardEvent | {metaKey: boolean; ctrlKey: boolean},
): boolean {
    return isMacintosh ? event.metaKey : event.ctrlKey;
}
