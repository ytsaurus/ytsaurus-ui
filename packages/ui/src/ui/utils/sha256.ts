export async function sha256(str: string) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));

    return [...new Uint8Array(buf)].map((x) => ('00' + x.toString(16)).slice(-2)).join('');
}

export const isCryptoSubtleAvailable = () => {
    return Boolean(crypto?.subtle?.digest);
};
