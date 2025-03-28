import {type IRange, type editor, languages} from 'monaco-editor';
import {YqlAutocompleteResult} from '@gravity-ui/websql-autocomplete/yql';
import {ClickHouseAutocompleteResult} from '@gravity-ui/websql-autocomplete/clickhouse';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';

type Props = (data: {
    model: editor.ITextModel;
    parseResult: YqlAutocompleteResult | ClickHouseAutocompleteResult;
    range: IRange;
}) => languages.CompletionItem[];

export const getTemplateSuggestions: Props = ({model, parseResult, range}) => {
    const result: languages.CompletionItem[] = [];

    const rangeContent = model
        .getLineContent(range.startLineNumber)
        .slice(range.startColumn - 2, range.endColumn);

    if (
        ('suggestTableFunctions' in parseResult && parseResult.suggestTableFunctions) ||
        ('suggestViewsOrTables' in parseResult && parseResult.suggestViewsOrTables)
    ) {
        const isBackquoteExists = rangeContent === '``';
        const label = isBackquoteExists ? '//' : '`//`';
        const insertText = isBackquoteExists ? '//${1:}' : '`//${1:}`';
        result.push({
            label,
            insertText,
            insertTextRules: languages.CompletionItemInsertTextRule.InsertAsSnippet,
            kind: languages.CompletionItemKind.Snippet,
            range,
            sortText: suggestionIndexToWeight(0),
        });
    }

    return result;
};
