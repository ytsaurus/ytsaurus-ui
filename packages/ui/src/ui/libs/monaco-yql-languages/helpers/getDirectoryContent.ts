import {type IRange, type Position, type editor, languages} from 'monaco-editor';
import {getPathFromMonacoModel} from './getPathFromMonacoModel';
import {type QueryEngine} from '../../../../shared/constants/engines';
import {SuggestionsWeight} from './generateSuggestions';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';
import {
    type CatalogCancellation,
    listQueryCatalogChildren,
    resolveQueryCatalogDirectory,
} from '../../../utils/query-tracker/queryCatalog';
import {prettyPrint} from '../../../utils/unipika';

type Props = (data: {
    model: editor.ITextModel;
    monacoCursorPosition: Position;
    engine: QueryEngine;
    range: IRange;
    token?: CatalogCancellation;
}) => Promise<languages.CompletionItem[]>;

export const getDirectoryContent: Props = async ({
    model,
    monacoCursorPosition,
    engine,
    range,
    token,
}) => {
    const pathData = getPathFromMonacoModel(model, monacoCursorPosition, engine);
    if (!pathData) return [];

    const {path, cluster} = pathData;
    if (!path || !cluster) return [];

    try {
        const clearPath = await resolveQueryCatalogDirectory({clusterId: cluster, path}, token);
        if (!clearPath || token?.isCancellationRequested) return [];
        const response = await listQueryCatalogChildren(
            {clusterId: cluster, path: clearPath},
            token,
        );

        const rangeContent = model
            .getLineContent(range.startLineNumber)
            .slice(range.startColumn - 1, range.endColumn - 1);

        return response.reduce<languages.CompletionItem[]>((acc, item) => {
            const name = prettyPrint(item.name, {asHTML: false}).replaceAll('"', '');
            const fullPath = clearPath + '/' + name;
            const basePath = path.replace(new RegExp(rangeContent + '$'), '');
            const insertText = /[^/]\//.test(basePath)
                ? fullPath.replace(basePath, '')
                : fullPath.replace('//', '');

            acc.push({
                label: insertText,
                detail: fullPath,
                insertText,
                kind: languages.CompletionItemKind[item.kind === 'table' ? 'File' : 'Folder'],
                range,
                sortText: suggestionIndexToWeight(SuggestionsWeight.path),
            });

            return acc;
        }, []);
    } catch (e) {
        return [];
    }
};
