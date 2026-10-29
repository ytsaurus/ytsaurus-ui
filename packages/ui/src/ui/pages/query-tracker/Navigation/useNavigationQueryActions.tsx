import React, {useState} from 'react';
import type {QueryEngine} from '../../../../shared/constants/engines';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectDirtySinceLastSubmit,
    selectQueryEngine,
} from '../../../store/selectors/query-tracker/query';
import {selectNavigationClusterConfig} from '../../../store/selectors/query-tracker/queryNavigation';
import {selectQueryResultGlobalSettings} from '../../../store/selectors/query-tracker/queryResult';
import {
    copyPathToClipboard,
    makeNewQueryWithTableSelect,
} from '../../../store/actions/query-tracker/queryNavigation';
import {wrapApiPromiseByToaster} from '../../../utils/utils';
import {useMonaco} from '../hooks/useMonaco';
import {NewQueryPromt} from '../NewQueryButton/NewQueryButton';
import {makePathByQueryEngine} from './helpers/makePathByQueryEngine';
import {createTableSelect} from './helpers/createTableSelect';
import {insertTextWhereCursor} from './helpers/insertTextWhereCursor';
import {type QueryNavigationNode, getNavigationQueryEngines} from './helpers/queryActions';

export function useNavigationQueryActions(engineOverride?: QueryEngine) {
    const dispatch = useDispatch();
    const dirty = useSelector(selectDirtySinceLastSubmit);
    const selectedEngine = useSelector(selectQueryEngine);
    const engine = engineOverride ?? selectedEngine;
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const {pageSize} = selectQueryResultGlobalSettings();
    const {getEditor} = useMonaco();
    const [pending, setPending] = useState<{path: string; engine: QueryEngine} | null>(null);
    const createQuery = (node: QueryNavigationNode, nextEngine: QueryEngine) => {
        if (!clusterConfig || !getNavigationQueryEngines(node).includes(nextEngine)) return;
        if (dirty) setPending({path: node.path, engine: nextEngine});
        else dispatch(makeNewQueryWithTableSelect(node.path, nextEngine));
    };
    const insertPath = (path: string) => {
        if (!clusterConfig) return;
        insertTextWhereCursor(
            makePathByQueryEngine({cluster: clusterConfig.id, path, engine}),
            getEditor('queryEditor'),
        );
    };
    const insertSelect = async (node: QueryNavigationNode, limit = pageSize) => {
        if (!clusterConfig || !getNavigationQueryEngines(node).includes(engine)) return;
        const editor = getEditor('queryEditor');
        const text = await wrapApiPromiseByToaster(
            createTableSelect({clusterConfig, path: node.path, engine, limit}),
            {skipSuccessToast: true, toasterName: 'query_navigation_insert_select'},
        ).catch(() => undefined);
        if (text !== undefined) insertTextWhereCursor(text, editor);
    };
    const copyPath = (path: string) => {
        if (clusterConfig)
            dispatch(
                copyPathToClipboard(
                    makePathByQueryEngine({cluster: clusterConfig.id, path, engine}),
                ),
            );
    };
    return {
        engine,
        disabled: !clusterConfig,
        createQuery,
        insertPath,
        insertSelect,
        copyPath,
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
