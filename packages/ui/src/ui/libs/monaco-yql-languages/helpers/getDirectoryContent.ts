import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {IRange, Position, editor, languages} from 'monaco-editor';
import ypath from '../../../common/thor/ypath';
import {YPathItem} from '../../../pages/query-tracker/Plan/services/tables';
import {getPathFromMonacoModel} from './getPathFromMonacoModel';
import {QueryEngine} from '../../../pages/query-tracker/module/engines';
import {SuggestionsWeight} from './generateSuggestions';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';

type Props = (data: {
    model: editor.ITextModel;
    monacoCursorPosition: Position;
    engine: QueryEngine;
    range: IRange;
}) => Promise<languages.CompletionItem[]>;

export const getDirectoryContent: Props = async ({model, monacoCursorPosition, engine, range}) => {
    const path = getPathFromMonacoModel(model, monacoCursorPosition, engine);
    if (!path) return [];

    try {
        let clearPath = path.replace(/(\/$)/g, '');
        let pathExist = await ytApiV3.exists({path: clearPath});
        if (!pathExist) {
            clearPath = clearPath.split('/').slice(0, -1).join('/');
            pathExist = await ytApiV3.exists({path: clearPath});
            if (!pathExist) return [];
        }

        const response: YPathItem[] = await ytApiV3Id.list(YTApiId.navigationListNodes, {
            parameters: {
                path: clearPath,
                attributes: ['type', 'broken'],
            },
        });

        return response.reduce<languages.CompletionItem[]>((acc, item) => {
            const name = ypath.getValue(item);
            const {type, broken} = ypath.getAttributes(item);

            if (
                !['table', 'map_node', 'link'].includes(type) ||
                (type === 'link' && Boolean(broken))
            )
                return acc;

            const fullPath = clearPath + '/' + name;
            const insertText = /[^/]\//.test(path)
                ? fullPath.replace(path, '')
                : fullPath.replace('//', '');

            acc.push({
                label: fullPath,
                insertText,
                kind: languages.CompletionItemKind[type === 'table' ? 'File' : 'Folder'],
                range,
                sortText: suggestionIndexToWeight(SuggestionsWeight.path),
            });

            return acc;
        }, []);
    } catch (e) {
        return [];
    }
};
