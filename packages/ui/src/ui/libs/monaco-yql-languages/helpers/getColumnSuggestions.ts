import {type IRange, type editor, languages} from 'monaco-editor';
import {type TableContextSuggestion} from '@gravity-ui/websql-autocomplete/shared';
import {type QueryEngine} from '../../../../shared/constants/engines';
import {loadTableData} from './loadTableData';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';
import type {CatalogCancellation} from '../../../utils/query-tracker/queryCatalog';
import {SuggestionsWeight} from './generateSuggestions';

type Props = (data: {
    model: editor.ITextModel;
    engine: QueryEngine;
    tableSuggestions?: TableContextSuggestion;
    range: IRange;
    token?: CatalogCancellation;
}) => Promise<languages.CompletionItem[]>;

export const getColumnSuggestions: Props = async ({
    tableSuggestions,
    model,
    engine,
    range,
    token,
}) => {
    if (!tableSuggestions) return [];
    const result: languages.CompletionItem[] = [
        {
            label: '*',
            insertText: '*',
            kind: languages.CompletionItemKind.Field,
            range,
            sortText: suggestionIndexToWeight(SuggestionsWeight.suggestColumns),
        },
    ];

    const tables = await loadTableData(model.getValue(), engine, token);
    tableSuggestions.tables?.forEach(({name, alias}) => {
        const path = name.replace(/`/g, '');
        if (path in tables) {
            tables[path].forEach((column) => {
                const fullPath = alias ? `${alias}.${column}` : column;
                result.push({
                    label: {
                        label: fullPath,
                        description: 'Column',
                        detail: ` (${name})`,
                    },
                    insertText: fullPath,
                    kind: languages.CompletionItemKind.Field,
                    range,
                    sortText: suggestionIndexToWeight(SuggestionsWeight.suggestColumns),
                });
            });
        }
    });
    return result;
};
