import React, {useState} from 'react';
import type {NavigationAction} from '@gravity-ui/querieskit';
import type {NavigationNode} from '@ytsaurus/components';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectIsQueryDraftEditted,
    selectQueryEngine,
} from '../../../../store/selectors/query-tracker/query';
import {selectNavigationClusterConfig} from '../../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryResultGlobalSettings} from '../../../../store/selectors/query-tracker/queryResult';
import {
    copyPathToClipboard,
    makeNewQueryWithTableSelect,
} from '../../../../store/actions/query-tracker/queryNavigation';
import {QueryEngine} from '../../../../../shared/constants/engines';
import {isTableNode} from '../../../../utils/navigation/isTableNode';
import {wrapApiPromiseByToaster} from '../../../../utils/utils';
import {useMonaco} from '../../hooks/useMonaco';
import {NewQueryPromt} from '../../NewQueryButton/NewQueryButton';
import {makePathByQueryEngine} from '../helpers/makePathByQueryEngine';
import {createTableSelect} from '../helpers/createTableSelect';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';
import {useNavigationNodeActions} from '../useNavigationNodeActions';
import rowI18n from '../NodeList/NodeListRow/i18n';
import i18n from './i18n';

type Node = Pick<NavigationNode, 'path' | 'type' | 'dynamic'>;

export function useNavigationMenuActions() {
    const dispatch = useDispatch();
    const dirty = useSelector(selectIsQueryDraftEditted);
    const engine = useSelector(selectQueryEngine);
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const {pageSize} = selectQueryResultGlobalSettings();
    const {getEditor} = useMonaco();
    const {handleClipboardCopy, handleNewWindowOpen} = useNavigationNodeActions();
    const [pending, setPending] = useState<{path: string; engine: QueryEngine} | null>(null);
    const createQuery = (path: string, nextEngine: QueryEngine) => {
        if (dirty) setPending({path, engine: nextEngine});
        else dispatch(makeNewQueryWithTableSelect(path, nextEngine));
    };
    const insert = async (path: string, select: boolean) => {
        if (!clusterConfig) return;
        const editor = getEditor('queryEditor');
        const text = select
            ? await wrapApiPromiseByToaster(
                  createTableSelect({clusterConfig, path, engine, limit: pageSize}),
                  {skipSuccessToast: true, toasterName: 'query_navigation_insert_select'},
              ).catch(() => undefined)
            : makePathByQueryEngine({cluster: clusterConfig.id, path, engine});
        if (text !== undefined) insertTextWhereCursor(text, editor);
    };
    const getMenuActions = (node: Node): NavigationAction<unknown>[] => {
        const table = isTableNode(node.type);
        const actions: NavigationAction<unknown>[] = [
            {
                id: 'copy-path',
                title: i18n('action_copy-query-path'),
                content: null,
                onClick: () => {
                    if (clusterConfig)
                        dispatch(
                            copyPathToClipboard(
                                makePathByQueryEngine({
                                    cluster: clusterConfig.id,
                                    path: node.path,
                                    engine,
                                }),
                            ),
                        );
                },
            },
            {
                id: 'insert-path',
                title: i18n('action_insert-path'),
                content: null,
                onClick: () => {
                    return insert(node.path, false);
                },
            },
            {
                id: 'insert-select',
                title: i18n('action_insert-select'),
                content: null,
                hidden: !table || (!node.dynamic && engine === QueryEngine.YT_QL),
                onClick: () => {
                    return insert(node.path, true);
                },
            },
            ...[QueryEngine.YT_QL, QueryEngine.YQL, QueryEngine.CHYT, QueryEngine.SPYT].map(
                (nextEngine) => ({
                    id: 'create-' + nextEngine,
                    title: i18n('action_create-query', {
                        engine:
                            nextEngine === QueryEngine.YT_QL ? 'YT QL' : nextEngine.toUpperCase(),
                    }),
                    content: null,
                    hidden: !table || (nextEngine === QueryEngine.YT_QL && !node.dynamic),
                    onClick: () => createQuery(node.path, nextEngine),
                }),
            ),
            {
                id: 'copy-link',
                title: rowI18n('action_copy-link'),
                content: null,
                onClick: () => handleClipboardCopy(node.path),
            },
            {
                id: 'open',
                title: rowI18n('action_open-in-cluster'),
                content: null,
                onClick: () => handleNewWindowOpen(node.path),
            },
        ];
        return actions.map((action) => ({...action, disabled: !clusterConfig}));
    };
    return {
        getMenuActions,
        modal: (
            <NewQueryPromt
                visible={Boolean(pending)}
                cancel={() => setPending(null)}
                confirm={() => {
                    if (pending)
                        dispatch(makeNewQueryWithTableSelect(pending.path, pending.engine));
                    setPending(null);
                }}
            />
        ),
    };
}
