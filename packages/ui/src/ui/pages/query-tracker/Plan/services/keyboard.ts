import * as React from 'react';

let _isWindows = false;
let _isMacintosh = false;
let _isLinux = false;

if (typeof navigator === 'object') {
    const _userAgent = navigator.userAgent;
    _isWindows = _userAgent.indexOf('Windows') >= 0;
    _isMacintosh = _userAgent.indexOf('Macintosh') >= 0;
    _isLinux = _userAgent.indexOf('Linux') >= 0;
}

export const isWindows = _isWindows;
export const isMacintosh = _isMacintosh;
export const isLinux = _isLinux;
export const CtrlCmd = isMacintosh ? 'META' : 'CTRL';

export function getCurrentShortcut(event: KeyboardEvent | React.KeyboardEvent) {
    let shortcut = '';
    const specialKeys = getCurrentSpecialKeys(event);
    if (specialKeys) {
        shortcut += `${specialKeys}+`;
    }
    shortcut += event.key;
    return shortcut.toUpperCase();
}

export function getCurrentSpecialKeys(
    event:
        | KeyboardEvent
        | MouseEvent
        | PointerEvent
        | React.MouseEvent
        | React.KeyboardEvent
        | React.PointerEvent,
) {
    let shortcut = '';
    if (event.metaKey) {
        shortcut += 'Meta+';
    }
    if (event.ctrlKey) {
        shortcut += 'Ctrl+';
    }
    if (event.altKey) {
        shortcut += 'Alt+';
    }
    if (event.shiftKey) {
        shortcut += 'Shift+';
    }
    return shortcut.toUpperCase().slice(0, -1);
}

export function formatSpecialKey(key: string) {
    switch (key) {
        case 'META': {
            return '⌘';
        }
        case 'Alt': {
            return isMacintosh ? '⌥' : 'Alt';
        }
        case 'CTRL':
        case 'Control': {
            return isMacintosh ? '⌃' : 'Ctrl';
        }
        case 'Shift': {
            return isMacintosh ? '⇧' : 'Shift';
        }
        default: {
            return key;
        }
    }
}

const special = ['⌘', '⌥', '⇧', '⌃'];
export function formatShortcut(keys: string[]) {
    let mapped = keys.map((key) => formatSpecialKey(key));

    function getWeight(a: string) {
        const specialIndex = special.indexOf(a);
        if (specialIndex !== -1) {
            return specialIndex * -1;
        }
        return mapped.indexOf(a);
    }

    if (isMacintosh) {
        mapped = [...mapped].sort((a, b) => getWeight(a) - getWeight(b));
    }

    return mapped.join(isMacintosh ? '' : ' + ');
}
