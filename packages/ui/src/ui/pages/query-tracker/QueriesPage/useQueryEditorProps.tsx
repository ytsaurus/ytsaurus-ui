import {selectQuerySubmitting} from '../../../store/selectors/query-tracker/querySubmitting';
import {useQueryEngineChange} from '../hooks/useQueryEngineChange';
import {useInactiveCliquePolling} from '../hooks/useInactiveCliquePolling';
import React, {useState} from 'react';
import {KeyCode, KeyMod} from 'monaco-editor';
import type {QueryEditorProps} from '@gravity-ui/querieskit/widgets/QueryEditor';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectClusterLoading,
    selectIsQueryButtonActive,
    selectIsQueryLoading,
    selectQueryDraft,
    selectSupportedEnginesOptions,
} from '../../../store/selectors/query-tracker/query';
import {selectQueryClusters} from '../../../store/selectors/query-tracker/querySettings';
import {
    runQuery,
    setQueryCluster,
    setUserLastChoice,
    updateQueryDraft,
} from '../../../store/actions/query-tracker/query';
import {setSettingByKey} from '../../../store/actions/settings';
import {QueryEngine} from '../../../../shared/constants/engines';
import {ModalWithoutHandledScrollBar as Modal} from '../../../components/Modal/Modal';
import {useQueryAttachmentsProps} from './QueryAttachments/useQueryAttachmentsProps';
import type {QueryAttachment} from './QueryAttachments/attachments';
import type {BuiltinEngineSettings} from '@gravity-ui/querieskit/widgets/QueryEditor/presets/builtin';
import {useQuerySettingsProps} from './QuerySettingsPanel/useQuerySettingsProps';
import {useBuiltinEngineSettings} from './QuerySettingsPanel/useBuiltinEngineSettings';
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
}): {
    editorProps: QueryEditorProps<BuiltinEngineSettings, QueryAttachment, unknown>;
    modal: React.ReactNode;
} {
    const dispatch = useDispatch();
    const draft = useSelector(selectQueryDraft);
    const attachmentsProps = useQueryAttachmentsProps();
    const canRun = useSelector(selectIsQueryButtonActive);
    const loading = useSelector(selectIsQueryLoading);
    const clusterLoading = useSelector(selectClusterLoading);
    const supported = useSelector(selectSupportedEnginesOptions);
    const engineIds = supported.map(({value}) => value as QueryEngine);
    if (!engineIds.includes(draft.engine)) engineIds.push(draft.engine);
    const {engines, ...engineSettings} = useBuiltinEngineSettings(engineIds);
    const settingsProps = useQuerySettingsProps(engineSettings);
    const availableClusters = useSelector(selectQueryClusters);
    const chat = useChatToggle();
    const [pendingEngine, setPendingEngine] = useState<QueryEngine>();
    const submitting = useSelector(selectQuerySubmitting);
    const cluster = draft.settings?.cluster;
    const disabled = isRunDisabled({canRun, loading, clusterLoading, submitting});

    useInactiveCliquePolling();

    const execute = async (mode?: 'validate' | 'optimize') => {
        if (disabled || !active) return;
        if (mode && draft.engine !== QueryEngine.YQL) return;
        try {
            await dispatch(runQuery(onStartQuery, mode ? {execution_mode: mode} : undefined));
        } catch {}
    };
    const integration = useQueryEditorIntegration();

    const {showPrompt, applyEngine: changeEngine} = useQueryEngineChange({
        onChange: (engine) => {
            dispatch(setSettingByKey('global::queryTracker::lastEngine', engine));
            dispatch(setUserLastChoice());
        },
    });
    const applyEngine = (engine: QueryEngine) => {
        setPendingEngine(undefined);
        return changeEngine(engine);
    };
    const clusters = availableClusters.map(({id, name}) => ({
        id,
        title: name,
        disabled: clusterLoading,
    }));

    return {
        editorProps: {
            ...integration,
            active,
            shortcuts: {
                run: [
                    KeyMod.CtrlCmd + KeyCode.Enter,
                    KeyMod.WinCtrl + KeyCode.Enter,
                    KeyMod.CtrlCmd + KeyCode.KeyE,
                    KeyMod.WinCtrl + KeyCode.KeyE,
                    KeyCode.F8,
                ],
            },
            ...getEditorActions(draft.engine, disabled, submitting),
            value: draft.query || '',
            onChange: (query) => dispatch(updateQueryDraft({query, error: undefined})),
            engines: engines.map((engine) => {
                const option = supported.find(({value}) => value === engine.id);
                return {
                    ...engine,
                    title: option?.text ?? engine.title,
                    disabled: clusterLoading || !option,
                };
            }),
            engineId: draft.engine,
            onEngineChange: (id) => {
                if (clusterLoading || !supported.some(({value}) => value === id)) return;
                const engine = id as QueryEngine;
                if (showPrompt) setPendingEngine(engine);
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
            settingsProps,
            attachmentsProps,
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
