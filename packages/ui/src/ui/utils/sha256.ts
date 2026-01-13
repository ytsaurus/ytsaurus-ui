export const isCryptoSubtleAvailable = () => {
    return Boolean(crypto?.subtle?.digest);
};

export async function sha256(str: string) {
    if (!isCryptoSubtleAvailable()) {
        throw new Error(
            'crypto.subtle is not available. ' +
                'This usually happens when using HTTP instead of HTTPS. ' +
                'Use isCryptoSubtleAvailable() to check before calling sha256().',
        );
    }

    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));

    return [...new Uint8Array(buf)].map((x) => ('00' + x.toString(16)).slice(-2)).join('');
}
