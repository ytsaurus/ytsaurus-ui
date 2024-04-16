import {
    ColumnAliasSuggestion,
    KeywordSuggestion,
    YqlAutocompleteResult,
} from '@gravity-ui/websql-autocomplete';
import {IRange, languages} from 'monaco-editor';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';

export type SuggestionType =
    | keyof Omit<YqlAutocompleteResult, 'errors' | 'suggestEntity' | 'suggestDatabases'>
    | 'binding'
    | 'suggestConstants'
    | 'connection'
    | 'suggestOperators';

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
    suggestConstants: 13,
    suggestOperators: 14,
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
