import unipika from '../../common/thor/unipika';

export function decodeDynamicSpecText(value: string): string {
    if (Array.from(value).some((char) => char.charCodeAt(0) > 0xff)) {
        return value;
    }
    try {
        return unipika.utils.utf8.decode(value);
    } catch {
        return value;
    }
}
