export function toClassName(text?: string) {
    if ('string' !== typeof text) {
        return undefined;
    }

    return text.replace(/[^-_\w\d]/g, '_');
}
