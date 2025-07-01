import {YTApiId, ytApiV3, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {IRange, Position, editor, languages} from 'monaco-editor';
import ypath from '../../../common/thor/ypath';
import {YPathItem} from '../../../pages/query-tracker/Plan/services/tables';
import {getPathFromMonacoModel} from './getPathFromMonacoModel';
import {QueryEngine} from '../../../../shared/constants/engines';
import {SuggestionsWeight} from './generateSuggestions';
import {suggestionIndexToWeight} from './suggestionIndexToWeight';
import {getClusterProxy} from '../../../store/selectors/global';
import {YT} from '../../../config/yt-config';
import {prettyPrint} from '../../../utils/unipika';

type Props = (data: {
    model: editor.ITextModel;
    monacoCursorPosition: Position;
    engine: QueryEngine;
    range: IRange;
}) => Promise<languages.CompletionItem[]>;

export const getDirectoryContent: Props = async ({model, monacoCursorPosition, engine, range}) => {
    const pathData = getPathFromMonacoModel(model, monacoCursorPosition, engine);
    if (!pathData) return [];

    const {path, cluster} = pathData;
    if (!path || !cluster) return [];

    const clusterConfig = YT.clusters[cluster];
    if (!clusterConfig) return [];

    const apiSetup = {setup: {proxy: getClusterProxy(clusterConfig)}};

    try {
        let clearPath = path.replace(/(\/$)/g, '');
        let pathExist = await ytApiV3.exists({...apiSetup, parameters: {path: clearPath}});
        if (!pathExist) {
            if (/[^/]\/$/.test(path)) return []; // we exclude the situation when we have the wrong path
            clearPath = clearPath.split('/').slice(0, -1).join('/');
            pathExist = await ytApiV3.exists({...apiSetup, parameters: {path: clearPath}});
            if (!pathExist) return [];
        }

        const response: YPathItem[] = await ytApiV3Id.list(YTApiId.navigationListNodes, {
            ...apiSetup,
            parameters: {
                path: clearPath,
                attributes: ['type', 'broken'],
            },
        });

        const rangeContent = model
            .getLineContent(range.startLineNumber)
            .slice(range.startColumn - 1, range.endColumn - 1);

        return response.reduce<languages.CompletionItem[]>((acc, item) => {
            const name = prettyPrint(ypath.getValue(item), {asHTML: false}).replaceAll('"', '');
            const {type, broken} = ypath.getAttributes(item);

            if (!['table', 'map_node', 'link'].includes(type) || (type === 'link' && broken))
                return acc;

            const fullPath = clearPath + '/' + name;
            const basePath = path.replace(new RegExp(rangeContent + '$'), '');
            const insertText = /[^/]\//.test(basePath)
                ? fullPath.replace(basePath, '')
                : fullPath.replace('//', '');

            acc.push({
                label: insertText,
                detail: fullPath,
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
