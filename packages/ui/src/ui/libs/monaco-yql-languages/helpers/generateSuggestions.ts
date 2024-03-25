import {
    ColumnAliasSuggestion,
    KeywordSuggestion,
    YqlAutocompleteResult,
} from '@gravity-ui/websql-autocomplete';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';

type SuggestionType =
    | keyof Omit<YqlAutocompleteResult, 'errors' | 'suggestEntity' | 'suggestDatabases'>
    | 'binding'
    | 'connection';

const SuggestionsWeight: Record<SuggestionType, number> = {
    suggestTemplates: 0,
    suggestPragmas: 1,
    binding: 2,
    connection: 3,
    suggestColumns: 4,
    suggestColumnAliases: 5,
    suggestKeywords: 6,
    suggestAggregateFunctions: 7,
    suggestTableFunctions: 8,
    suggestWindowFunctions: 9,
    suggestFunctions: 10,
    suggestUdfs: 11,
    suggestSimpleTypes: 12,
};

export const generateColumnAliasesSuggestion = (
    rangeToInsertSuggestion: monaco.IRange,
    suggestColumnAliases?: ColumnAliasSuggestion[],
) => {
    if (!suggestColumnAliases) {
        return [];
    }
    return suggestColumnAliases.map((columnAliasSuggestion) => ({
        label: columnAliasSuggestion.name,
        insertText: columnAliasSuggestion.name,
        kind: monaco.languages.CompletionItemKind.Field,
        detail: 'Column alias',
        range: rangeToInsertSuggestion,
        sortText: suggestionIndexToWeight(SuggestionsWeight['suggestColumnAliases']),
    }));
};
export const generateKeywordsSuggestion = (
    rangeToInsertSuggestion: monaco.IRange,
    suggestKeywords?: KeywordSuggestion[],
) => {
    if (!suggestKeywords) {
        return [];
    }
    return suggestKeywords.map((keywordSuggestion) => ({
        label: keywordSuggestion.value,
        insertText: keywordSuggestion.value,
        kind: monaco.languages.CompletionItemKind.Keyword,
        detail: 'Keyword',
        range: rangeToInsertSuggestion,
        sortText: suggestionIndexToWeight(SuggestionsWeight['suggestKeywords']),
    }));
};
