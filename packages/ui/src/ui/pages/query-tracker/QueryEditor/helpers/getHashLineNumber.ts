export const getHashLineNumber = (): number | null => {
    const {hash} = window.location;
    if (!hash.startsWith('#L')) return null;

    const lineNumber = parseInt(hash.replace(/[^0-9]/g, ''), 10);
    return isNaN(lineNumber) ? null : lineNumber;
};
