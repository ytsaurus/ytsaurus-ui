const FILENAME_PATTERN = /[a-z0-9._-]+/;

const CONTENT_DISPOSITION_FILENAME_PATTERN = new RegExp(
    String.raw`;\s*filename=(?:"(${FILENAME_PATTERN.source})"|(${FILENAME_PATTERN.source}))\s*(?=;|$)`,
    'i',
);

export const getContentDispositionFilename = (header: string): string | undefined => {
    const matches = header.match(CONTENT_DISPOSITION_FILENAME_PATTERN);

    return matches?.[1] ?? matches?.[2];
};
