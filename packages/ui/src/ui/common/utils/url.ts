export function absolute(relative: string, base?: string) {
    if (relative[0] === '/') {
        return relative;
    }

    if (base === undefined) {
        base = window?.location.pathname || '';
    }

    const stack = base.split('/');
    const parts = relative.split('/');
    stack.pop();
    for (let i = 0; i < parts.length; i++) {
        if (parts[i] == '.') {
            continue;
        }
        if (parts[i] == '..') {
            stack.pop();
        } else {
            stack.push(parts[i]);
        }
    }
    return stack.join('/');
}

export function isLinkExternal(url: string) {
    return url.startsWith('//') || url.startsWith('http');
}
