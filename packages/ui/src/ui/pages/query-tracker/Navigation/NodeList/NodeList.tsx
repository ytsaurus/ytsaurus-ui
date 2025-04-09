import React, {FC, useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
    selectLoading,
    selectNavigationClusterConfig,
    selectNodeListByFilter,
} from '../../module/queryNavigation/selectors';
import {NodeListRow} from './NodeListRow';
import {
    copyPathToClipboard,
    loadNodeByPath,
    loadTableAttributesByPath,
    makeNewQueryWithTableSelect,
    toggleFavoritePath,
} from '../../module/queryNavigation/actions';
import './NodeList.scss';
import cn from 'bem-cn-lite';
import {isFolderNode} from '../helpers/isFolderNode';
import {isTableNode} from '../helpers/isTableNode';
import {useMonaco} from '../../hooks/useMonaco';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {getQueryEngine, isQueryDraftEditted} from '../../module/query/selectors';
import {makePathByQueryEngine} from '../helpers/makePathByQueryEngine';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {getNavigationUrl} from '../helpers/getNavigationUrl';
import {createTableSelect} from '../helpers/createTableSelect';
import {getQueryResultGlobalSettings} from '../../module/query_result/selectors';
import {useToggle} from 'react-use';
import {NewQueryPromt} from '../../NewQueryButton/NewQueryButton';
import {ItemsList} from '../ItemsList';

const b = cn('navigation-node-list');

export const NodeList: FC = () => {
    const dispatch = useDispatch();
    const [showPrompt, togglePrompt] = useToggle(false);
    const newQueryParams = useRef<{path: string; engine: QueryEngine} | null>(null);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const nodes = useSelector(selectNodeListByFilter);
    const engine = useSelector(getQueryEngine);
    const {pageSize} = getQueryResultGlobalSettings();
    const dirtyQuery = useSelector(isQueryDraftEditted);
    const loading = useSelector(selectLoading);
    const {getEditor} = useMonaco();

    const handleNodeClick = (path: string, type: string | undefined) => {
        if (isFolderNode(type)) {
            dispatch(loadNodeByPath(path));
            return;
        }
        if (isTableNode(type)) {
            dispatch(loadTableAttributesByPath(path));
            return;
        }
    };

    const handleFavoriteToggle = useCallback(
        (favoritePath: string) => {
            dispatch(toggleFavoritePath(favoritePath));
        },
        [dispatch],
    );

    const handleEditorInsert = useCallback(
        async (path: string, type: 'path' | 'select') => {
            if (!clusterConfig || !clusterConfig.id) return;
            const editor = getEditor('queryEditor');
            let text = '';
            if (type === 'path') {
                text = makePathByQueryEngine({
                    cluster: clusterConfig.id,
                    path,
                    engine,
                });
            } else {
                text = await createTableSelect({clusterConfig, path, engine, limit: pageSize});
            }
            insertTextWhereCursor(text, editor);
        },
        [clusterConfig, engine, getEditor, pageSize],
    );

    const onClipboardCopy = useCallback(
        (path: string, type: 'path' | 'url') => {
            if (!clusterConfig || !clusterConfig.id) return;
            const pathString =
                type === 'path'
                    ? makePathByQueryEngine({
                          cluster: clusterConfig.id,
                          path,
                          engine,
                      })
                    : getNavigationUrl(clusterConfig.id, path);
            dispatch(copyPathToClipboard(pathString));
        },
        [clusterConfig, dispatch, engine],
    );

    const handleNewWindowOpen = useCallback(
        (path: string) => {
            if (!clusterConfig || !clusterConfig.id) return;
            const url = new URL(location.origin + `/${clusterConfig.id}/navigation`);
            url.searchParams.append('path', path);
            window.open(url);
        },
        [clusterConfig],
    );

    const handlePromptConfirm = useCallback(() => {
        const editor = getEditor('queryEditor');
        const parameters = newQueryParams.current;
        if (!editor || !parameters) return;
        dispatch(makeNewQueryWithTableSelect(parameters.path, parameters.engine, editor));
        togglePrompt();
    }, [dispatch, getEditor, togglePrompt]);

    const handlePromptCancel = useCallback(() => {
        newQueryParams.current = null;
        togglePrompt();
    }, [togglePrompt]);

    const handleNewQuery = useCallback(
        async (path: string, newEngine: QueryEngine) => {
            if (dirtyQuery) {
                togglePrompt();
                newQueryParams.current = {path, engine: newEngine};
                return;
            }

            newQueryParams.current = {path, engine: newEngine};
            handlePromptConfirm();
        },
        [dirtyQuery, handlePromptConfirm, togglePrompt],
    );

    return (
        <div className={b()}>
            <ItemsList
                loading={loading}
                data={nodes}
                render={(node) => {
                    return (
                        <NodeListRow
                            key={node.path}
                            node={node}
                            queryEngine={engine}
                            onClick={handleNodeClick}
                            onFavoriteToggle={handleFavoriteToggle}
                            onEditorInsert={handleEditorInsert}
                            onClipboardCopy={onClipboardCopy}
                            onNewWindowOpen={handleNewWindowOpen}
                            onNewQuery={handleNewQuery}
                        />
                    );
                }}
            />
            <NewQueryPromt
                confirm={handlePromptConfirm}
                cancel={handlePromptCancel}
                visible={showPrompt}
            />
        </div>
    );
};

export default NodeList;
