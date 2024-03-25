import * as monaco from 'monaco-editor';
import {
    ClickHouseAutocompleteResult,
    CursorPosition,
    YqlAutocompleteResult,
} from '@gravity-ui/websql-autocomplete';
import {generateColumnAliasesSuggestion, generateKeywordsSuggestion} from './generateSuggestions';

export type Parser = (
    query: string,
    cursorPosition: CursorPosition,
) => YqlAutocompleteResult | ClickHouseAutocompleteResult;

export const getSuggestions = (
    model: monaco.editor.ITextModel,
    cursorPosition: CursorPosition,
    rangeToInsertSuggestion: monaco.IRange,
    parser: Parser,
): monaco.languages.CompletionItem[] => {
    const parseResult = parser(model.getValue(), cursorPosition);

    const columnAliasSuggestion = generateColumnAliasesSuggestion(
        rangeToInsertSuggestion,
        parseResult.suggestColumnAliases,
    );

    const keywordsSuggestions = generateKeywordsSuggestion(
        rangeToInsertSuggestion,
        parseResult.suggestKeywords,
    );

    return [...columnAliasSuggestion, ...keywordsSuggestions];
};
