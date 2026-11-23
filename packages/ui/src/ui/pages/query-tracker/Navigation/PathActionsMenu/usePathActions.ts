import {useState} from 'react';
import type {NavigationAction, NavigationActionGroup} from '@gravity-ui/querieskit';
import i18n from './i18n';
import {QueryEngine} from '../../../../../shared/constants/engines';
import type {NavigationNode} from '@ytsaurus/components';
import {isTableNode} from '../../../../utils/navigation/isTableNode';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {selectIsQueryDraftEditted} from '../../../../store/selectors/query-tracker/query';
import {useMonaco} from '../../hooks/useMonaco';
import {
    copyPathToClipboard,
    makeNewQueryWithTableSelect,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {makePathByQueryEngine} from '../helpers/makePathByQueryEngine';
import {selectNavigationClusterConfig} from '../../../../store/selectors/query-tracker/queryNavigation';
import {createTableSelect} from '../helpers/createTableSelect';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {selectQueryResultGlobalSettings} from '../../../../store/selectors/query-tracker/queryResult';

export type PathActionsNode = Pick<NavigationNode, 'path' | 'type' | 'dynamic'>;

type Options = {
    node: PathActionsNode;
    engine: QueryEngine;
    grouped: boolean;
};

export function usePathActions({node, engine, grouped}: Options) {
    const dispatch = useDispatch();
    const dirtyQuery = useSelector(selectIsQueryDraftEditted);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const {getEditor} = useMonaco();
    const {pageSize} = selectQueryResultGlobalSettings();

    const [pendingQuery, setPendingQuery] = useState<{path: string; engine: QueryEngine}>();
    const {dynamic, path, type} = node;
    const tableNode = isTableNode(type);

    const handlePromptConfirm = () => {
        if (!pendingQuery) {
            return;
        }
        dispatch(makeNewQueryWithTableSelect(pendingQuery.path, pendingQuery.engine));
        setPendingQuery(undefined);
    };

    const handleNewQuery = (queryPath: string, newEngine: QueryEngine) => {
        if (dirtyQuery) {
            setPendingQuery({path: queryPath, engine: newEngine});
            return;
        }
        dispatch(makeNewQueryWithTableSelect(queryPath, newEngine));
    };

    const handleClipboardCopy = (nodePath: string, copyEngine: QueryEngine) => {
        if (!clusterConfig || !clusterConfig.id) {
            return;
        }
        const pathString = makePathByQueryEngine({
            cluster: clusterConfig.id,
            path: nodePath,
            engine: copyEngine,
        });
        dispatch(copyPathToClipboard(pathString));
    };

    const handleEditorInsert = async (nodePath: string, insertMode: 'path' | 'select') => {
        if (!clusterConfig || !clusterConfig.id) {
            return;
        }
        const editor = getEditor('queryEditor');
        let text = '';
        if (insertMode === 'path') {
            text = makePathByQueryEngine({
                cluster: clusterConfig.id,
                path: nodePath,
                engine,
            });
        } else {
            text = await createTableSelect({
                clusterConfig,
                path: nodePath,
                engine,
                limit: pageSize,
            });
        }
        insertTextWhereCursor(text, editor);
    };

    const copyActions: NavigationAction<PathActionsNode>[] = [
        {
            id: 'path',
            title: i18n('value_path'),
            content: null,
            onClick: () => handleClipboardCopy(path, grouped ? QueryEngine.YQL : engine),
        },
    ];
    if (grouped) {
        copyActions.push(
            {
                id: 'path-chyt',
                title: i18n('value_path-chyt'),
                content: null,
                onClick: () => handleClipboardCopy(path, QueryEngine.CHYT),
            },
            {
                id: 'path-spyt',
                title: i18n('value_path-spyt'),
                content: null,
                onClick: () => handleClipboardCopy(path, QueryEngine.SPYT),
            },
        );
    }

    const insertActions: NavigationAction<PathActionsNode>[] = [
        {
            id: 'path',
            title: i18n('value_path'),
            content: null,
            onClick: () => handleEditorInsert(path, 'path'),
        },
    ];
    if (tableNode && (dynamic || engine !== QueryEngine.YT_QL)) {
        insertActions.push({
            id: 'select',
            title: i18n('value_select'),
            content: null,
            onClick: () => handleEditorInsert(path, 'select'),
        });
    }

    const groups: NavigationActionGroup<PathActionsNode>[] = [
        {id: 'copy', title: i18n('action_copy-to-clipboard'), actions: copyActions},
        {id: 'insert', title: i18n('action_insert-into-editor'), actions: insertActions},
    ];
    if (tableNode) {
        const queryActions: NavigationAction<PathActionsNode>[] = [];
        if (dynamic) {
            queryActions.push({
                id: 'select-yt-ql',
                title: i18n('value_select-yt-ql'),
                content: null,
                onClick: () => handleNewQuery(path, QueryEngine.YT_QL),
            });
        }
        queryActions.push(
            {
                id: 'select-yql',
                title: grouped ? i18n('value_select-sql') : i18n('value_select-yql'),
                content: null,
                onClick: () => handleNewQuery(path, QueryEngine.YQL),
            },
            {
                id: 'select-chyt',
                title: grouped ? i18n('value_select-ch-over-yt') : i18n('value_select-chyt'),
                content: null,
                onClick: () => handleNewQuery(path, QueryEngine.CHYT),
            },
            {
                id: 'select-spyt',
                title: grouped ? i18n('value_select-spark-over-yt') : i18n('value_select-spyt'),
                content: null,
                onClick: () => handleNewQuery(path, QueryEngine.SPYT),
            },
        );
        groups.push({id: 'query', title: i18n('action_create-new-query'), actions: queryActions});
    }

    return {
        groups,
        newQueryPromptProps: {
            confirm: handlePromptConfirm,
            cancel: () => setPendingQuery(undefined),
            visible: Boolean(pendingQuery),
        },
    };
}
