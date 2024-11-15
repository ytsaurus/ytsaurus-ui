import {IRange, languages} from 'monaco-editor';
import {YqlAutocompleteResult} from '@gravity-ui/websql-autocomplete/yql';
import {ClickHouseAutocompleteResult} from '@gravity-ui/websql-autocomplete/clickhouse';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';

type Props = (data: {
    parseResult: YqlAutocompleteResult | ClickHouseAutocompleteResult;
    range: IRange;
}) => languages.CompletionItem[];

export const getTemplateSuggestions: Props = ({parseResult, range}) => {
    const result: languages.CompletionItem[] = [];

    if (
        ('suggestTableFunctions' in parseResult && parseResult.suggestTableFunctions) ||
        ('suggestViewsOrTables' in parseResult && parseResult.suggestViewsOrTables)
    ) {
        result.push({
            label: '`//`',
            insertText: '`//${1:}`',
            insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
            kind: languages.CompletionItemKind.Snippet,
            range,
            sortText: suggestionIndexToWeight(0),
        });
    }

    return result;
};
