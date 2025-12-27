import {YqlAutocompleteResult} from '@gravity-ui/websql-autocomplete/yql';
import {ColumnAliasSuggestion, KeywordSuggestion} from '@gravity-ui/websql-autocomplete/shared';
import {IRange, languages} from 'monaco-editor';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';

export type SuggestionType =
    | keyof Omit<YqlAutocompleteResult, 'errors' | 'suggestEntity' | 'suggestDatabases'>
    | 'binding'
    | 'suggestConstants'
    | 'connection'
    | 'suggestOperators'
    | 'path';

export const SuggestionsWeight: Record<SuggestionType, number> = {
    path: 0,
    suggestTemplates: 1,
    suggestPragmas: 2,
    binding: 3,
    connection: 4,
    suggestVariables: 4,
    suggestColumns: 5,
    suggestColumnAliases: 6,
    suggestKeywords: 7,
    suggestAggregateFunctions: 8,
    suggestTableFunctions: 9,
    suggestWindowFunctions: 10,
    suggestFunctions: 11,
    suggestUdfs: 12,
    suggestSimpleTypes: 13,
    suggestConstants: 14,
    suggestOperators: 15,
    suggestTableIndexes: 16,
    suggestTableHints: 17,
    suggestEntitySettings: 18,
};

export const generateColumnAliasesSuggestion = (
    rangeToInsertSuggestion: IRange,
    suggestColumnAliases?: ColumnAliasSuggestion[],
): languages.CompletionItem[] => {
    if (!suggestColumnAliases) {
        return [];
    }
    return suggestColumnAliases.map((columnAliasSuggestion) => ({
        label: columnAliasSuggestion.name,
        insertText: columnAliasSuggestion.name,
        kind: languages.CompletionItemKind.Field,
        detail: 'Column alias',
        range: rangeToInsertSuggestion,
        sortText: suggestionIndexToWeight(SuggestionsWeight['suggestColumnAliases']),
    }));
};
export const generateKeywordsSuggestion = (
    rangeToInsertSuggestion: IRange,
    suggestKeywords?: KeywordSuggestion[],
): languages.CompletionItem[] => {
    if (!suggestKeywords) {
        return [];
    }
    return suggestKeywords.map((keywordSuggestion) => ({
        label: keywordSuggestion.value,
        insertText: keywordSuggestion.value,
        kind: languages.CompletionItemKind.Keyword,
        detail: 'Keyword',
        range: rangeToInsertSuggestion,
        sortText: suggestionIndexToWeight(SuggestionsWeight['suggestKeywords']),
    }));
};

type GenerateSuggestionProps = (data: {
    kind: languages.CompletionItemKind;
    detail: string;
    suggestionType: SuggestionType;
    rangeToInsertSuggestion: IRange;
    items: string[];
}) => languages.CompletionItem[];
export const generateSuggestion: GenerateSuggestionProps = ({
    kind,
    detail,
    suggestionType,
    rangeToInsertSuggestion,
    items,
}) => {
    return items.map((el) => ({
        label: el,
        insertText: el,
        kind,
        detail,
        range: rangeToInsertSuggestion,
        sortText: suggestionIndexToWeight(SuggestionsWeight[suggestionType]),
    }));
};
