import {IRange, languages} from 'monaco-editor';
import {YqlAutocompleteResult} from '@gravity-ui/websql-autocomplete/yql';
import {ClickHouseAutocompleteResult} from '@gravity-ui/websql-autocomplete/clickhouse';
import {CursorPosition} from '@gravity-ui/websql-autocomplete/shared';
import {generateColumnAliasesSuggestion, generateKeywordsSuggestion} from './generateSuggestions';

export type Parser = (
    query: string,
    cursorPosition: CursorPosition,
) => YqlAutocompleteResult | ClickHouseAutocompleteResult;

export const getSuggestions = (
    parseResult: YqlAutocompleteResult | ClickHouseAutocompleteResult,
    rangeToInsertSuggestion: IRange,
): languages.CompletionItem[] => {
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
