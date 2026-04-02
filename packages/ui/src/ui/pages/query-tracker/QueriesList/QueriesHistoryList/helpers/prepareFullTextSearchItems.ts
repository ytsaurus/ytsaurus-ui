import {type QueryItem} from '../../../../../types/query-tracker/api';

const lineIndexAtCharIndex = (lines: string[], charIndex: number) => {
    let charPos = 0;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineEnd = charPos + line.length;
        if (charIndex <= lineEnd) {
            return i;
        }
        charPos = lineEnd + 1;
    }
    return Math.max(0, lines.length - 1);
};

type QueryPreviewSlice = {text: string; firstLineNumber: number};

const prepareQueryPreview = ({
    query,
    filter,
    maxLines,
}: {
    query: string;
    filter?: string;
    maxLines: number;
}): QueryPreviewSlice => {
    const search = filter?.trim();
    const text = query.trim();
    const lines = text.split(/\r?\n/);

    if (lines.length <= maxLines) {
        const fill = maxLines - lines.length;
        const arr = fill ? Array.from({length: fill}).map((_) => '') : [];
        return {text: [...lines, ...arr].join('\n'), firstLineNumber: 1};
    }

    if (!search) {
        return {text: lines.slice(0, maxLines).join('\n'), firstLineNumber: 1};
    }

    const lowerText = text.toLowerCase();
    const lowerSearch = search.toLowerCase();
    const matchIndex = lowerText.indexOf(lowerSearch);

    if (matchIndex === -1) {
        return {text: lines.slice(0, maxLines).join('\n'), firstLineNumber: 1};
    }

    const matchLine = lineIndexAtCharIndex(lines, matchIndex);
    const maxStart = Math.max(0, lines.length - maxLines);
    const start = Math.min(matchLine, maxStart);

    return {
        text: lines.slice(start, start + maxLines).join('\n'),
        firstLineNumber: start + 1,
    };
};

export const prepareFullTextSearchItems = ({
    items,
    filter,
    maxLines,
}: {
    items: QueryItem[];
    filter?: string;
    maxLines: number;
}) => {
    const trimmed = filter?.trim();
    if (!trimmed) return items;

    return items.map((i) => {
        const {text, firstLineNumber} = prepareQueryPreview({
            query: i.query ?? '',
            filter: trimmed,
            maxLines,
        });
        return {
            ...i,
            query: text,
            queryPreviewLineNumberStart: firstLineNumber,
        };
    });
};
