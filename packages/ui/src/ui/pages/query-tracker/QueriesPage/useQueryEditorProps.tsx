import React, {useEffect, useRef, useState} from 'react';
import type {QueryEditorProps} from '@gravity-ui/querieskit/widgets/QueryEditor';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectClusterLoading,
    selectDirtySinceLastSubmit,
    selectHasLoadedQueryItem,
    selectIsQueryButtonActive,
    selectIsQueryLoading,
    selectQueryDraft,
    selectQueryGetParams,
    selectShouldPollCliqueWhenInactive,
    selectSupportedEnginesOptions,
} from '../../../store/selectors/query-tracker/query';
import {selectQueryTrackerInfoClusters} from '../../../store/selectors/query-tracker/queryAco';
import {selectClusterList} from '../../../store/selectors/slideoutMenu';
import {
    createQueryFromTablePath,
    loadCliqueByCluster,
    runQuery,
    setQueryCluster,
    setQueryEngine,
    setUserLastChoice,
    updateQueryDraft,
} from '../../../store/actions/query-tracker/query';
import {setSettingByKey} from '../../../store/actions/settings';
import {QueryEngine} from '../../../../shared/constants/engines';
import {YT} from '../../../config/yt-config';
import {ModalWithoutHandledScrollBar as Modal} from '../../../components/Modal/Modal';
import {toaster} from '../../../utils/toaster';
import {QueryFilesButton} from '../QueryFilesButton';
import {QuerySettingsPanel} from './QuerySettingsPanel/QuerySettingsPanel';
import {getLanguageByEngine} from '../QueryEditor/helpers/getLanguageByEngine';
import {getMonacoConfig} from '../QueryEditor/getMonacoConfig';
import {useChatToggle} from '../../../containers/AiChat/ChatToggleButton/useChatToggle';
import {useQueryEditorIntegration} from './useQueryEditorIntegration';
import {getEditorActions, isRunDisabled} from './helpers';
import engineI18n from '../QueryTrackerTopRow/QueryEngineSelector/i18n';
import editorI18n from '../QueryEditor/QueryEditorView/i18n';

export function useQueryEditorProps({
    onStartQuery,
    active,
}: {
    onStartQuery: (id: string) => boolean | void;
    active: boolean;
}): {editorProps: QueryEditorProps; modal: React.ReactNode} {
    const dispatch = useDispatch();
    const draft = useSelector(selectQueryDraft);
    const canRun = useSelector(selectIsQueryButtonActive);
    const loading = useSelector(selectIsQueryLoading);
    const clusterLoading = useSelector(selectClusterLoading);
    const dirty = useSelector(selectDirtySinceLastSubmit);
    const loaded = useSelector(selectHasLoadedQueryItem);
    const params = useSelector(selectQueryGetParams);
    const supported = useSelector(selectSupportedEnginesOptions);
    const infoClusters = useSelector(selectQueryTrackerInfoClusters);
    const knownClusters = useSelector(selectClusterList);
    const shouldPollClique = useSelector(selectShouldPollCliqueWhenInactive);
    const chat = useChatToggle();
    const [pendingEngine, setPendingEngine] = useState<QueryEngine>();
    const [submitting, setSubmitting] = useState(false);
    const submittingRef = useRef(false);
    const cluster = draft.settings?.cluster;
    const disabled = isRunDisabled({canRun, loading, clusterLoading, submitting});

    useEffect(() => {
        if (!shouldPollClique || !cluster) return undefined;
        const timer = setInterval(
            () => dispatch(loadCliqueByCluster(QueryEngine.CHYT, cluster)),
            5000,
        );
        return () => clearInterval(timer);
    }, [dispatch, shouldPollClique, cluster]);

    const execute = async (mode?: 'validate' | 'optimize') => {
        if (disabled || submittingRef.current || !active) return;
        if (mode && draft.engine !== QueryEngine.YQL) return;
        submittingRef.current = true;
        setSubmitting(true);
        try {
            await dispatch(runQuery(onStartQuery, mode ? {execution_mode: mode} : undefined));
        } catch {
            // runQuery displays API errors through the existing toaster.
        } finally {
            submittingRef.current = false;
            setSubmitting(false);
        }
    };
    const integration = useQueryEditorIntegration({
        active,
        onRun: () => execute(),
        runDisabled: disabled,
    });

    const applyEngine = async (engine: QueryEngine) => {
        setPendingEngine(undefined);
        try {
            if (params.cluster && params.path) {
                await dispatch(createQueryFromTablePath(engine, params.cluster, params.path));
            } else {
                dispatch(setQueryEngine(engine));
            }
            dispatch(setSettingByKey('global::queryTracker::lastEngine', engine));
            dispatch(setUserLastChoice());
        } catch {
            toaster.add({
                name: 'query_engine_selector_change_failed',
                theme: 'danger',
                title: engineI18n('alert_change-engine-failed'),
            });
        }
    };
    const clusters =
        YT.isLocalCluster && infoClusters?.length
            ? infoClusters.map((id) => ({id, title: id, disabled: clusterLoading}))
            : knownClusters
                  .filter(({id}) => !infoClusters?.length || infoClusters.includes(id))
                  .map(({id, name}) => ({id, title: name, disabled: clusterLoading}));
    // A local installation can omit a global cluster catalog.
    if (cluster && !clusters.some(({id}) => id === cluster))
        clusters.push({id: cluster, title: cluster, disabled: clusterLoading});

    return {
        editorProps: {
            ...integration,
            ...getEditorActions(draft.engine, disabled, submitting),
            value: draft.query || '',
            onChange: (query) => dispatch(updateQueryDraft({query, error: undefined})),
            engines: supported.map(({value, text}) => ({
                id: value,
                title: text,
                language: getLanguageByEngine(value as QueryEngine),
                disabled: clusterLoading,
            })),
            engineId: draft.engine,
            onEngineChange: (id) => {
                if (clusterLoading || !supported.some(({value}) => value === id)) return;
                const engine = id as QueryEngine;
                if (params.cluster && params.path && (dirty || loaded)) setPendingEngine(engine);
                else applyEngine(engine);
            },
            clusters,
            clusterId: cluster,
            onClusterChange: (id) => {
                if (!clusterLoading) dispatch(setQueryCluster(id));
            },
            onRun: () => execute(),
            onValidate: () => execute('validate'),
            additionalActions:
                draft.engine === QueryEngine.YQL
                    ? [
                          {
                              id: 'explain',
                              title: editorI18n('action_explain'),
                              disabled,
                              onClick: () => execute('optimize'),
                          },
                      ]
                    : [],
            editorOptions: {...getMonacoConfig(draft.engine), wordBasedSuggestions: 'off'},
            readOnly: loading,
            settings: <QuerySettingsPanel />,
            attachments: <QueryFilesButton inline />,
            onCodeAssistantClick: chat.isConfigured ? chat.toggle : undefined,
        },
        modal: (
            <Modal
                visible={Boolean(pendingEngine)}
                title={engineI18n('title_switching-engine')}
                content={engineI18n('confirm_switching-engine')}
                onCancel={() => setPendingEngine(undefined)}
                onConfirm={() => {
                    if (pendingEngine) applyEngine(pendingEngine);
                }}
            />
        ),
    };
}
