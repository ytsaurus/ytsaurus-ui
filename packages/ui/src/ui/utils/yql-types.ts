export function isImageTag(value: string) {
    return /image\/.*/.test(value);
}

export function isVideoTag(value: string) {
    return /video\/.*/.test(value);
}

export function isMediaTag(value: string) {
    return isImageTag(value) || isVideoTag(value);
}
