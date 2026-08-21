import React from 'react';

import {Alert, Flex, Loader, Text} from '@gravity-ui/uikit';

import {
    type DialogField,
    type FormApi,
    YTDFDialog,
    makeFormSubmitError,
} from '../../../../../containers/Dialog';
import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';

import {type FlowDeletePermissionQuery, areAllCommitted, countCommitted} from '../state-delete';
import {getStateRowId} from '../state-requests';
import {OutcomesSummary} from './OutcomesSummary';
import {RowsSummary} from './RowsSummary';
import {useFlowDeleteStates} from './use-flow-delete-states';
import i18n from './i18n';
import type {FlowRowDeleteOutcome, FlowStateResultRow} from '../types';

export type FlowDeleteStatesDialogProps = {
    visible: boolean;
    onClose: () => void;
    pipeline_path: string;
    rows: Array<FlowStateResultRow>;
    permission: FlowDeletePermissionQuery;
    onCommitted: (outcomes: Array<FlowRowDeleteOutcome>, allCommitted: boolean) => void;
};

type FormValues = {force: boolean};

export function FlowDeleteStatesDialog({
    visible,
    onClose,
    pipeline_path,
    rows,
    permission,
    onCommitted,
}: FlowDeleteStatesDialogProps) {
    const [outcomes, setOutcomes] = React.useState<Array<FlowRowDeleteOutcome>>();
    const allowAutomaticSuccessCloseRef = React.useRef(false);
    const {
        gate,
        stateReady,
        permissionReady,
        pipelineStateError,
        permissionError,
        runDeleteStates,
    } = useFlowDeleteStates({visible, pipeline_path, rows, permission});

    React.useEffect(() => {
        if (visible) {
            setOutcomes(undefined);
        }
        allowAutomaticSuccessCloseRef.current = false;
    }, [visible, rows]);

    const fields = React.useMemo<Array<DialogField<FormValues>>>(() => {
        const status = (
            <Flex direction="column" gap={3}>
                <RowsSummary rows={rows} />
                {!stateReady &&
                    (pipelineStateError ? (
                        <YTErrorBlock error={pipelineStateError as YTErrorBlockProps['error']} />
                    ) : (
                        <Loader size="m" />
                    ))}
                {!permissionReady &&
                    (permissionError ? (
                        <YTErrorBlock error={permissionError as YTErrorBlockProps['error']} />
                    ) : (
                        <Alert theme="warning" message={i18n('alert_permission-unavailable')} />
                    ))}
                {stateReady && gate.blocked && (
                    <Alert theme="warning" message={i18n('alert_pipeline-running')} />
                )}
                {stateReady && gate.requiresForce && (
                    <Alert theme="warning" message={i18n('alert_force-paused')} />
                )}
                {outcomes && !areAllCommitted(outcomes, rows.length) && (
                    <React.Fragment>
                        <Alert theme="danger" message={i18n('alert_delete-failed')} />
                        <Text>
                            {i18n('text_deleted-count', {
                                done: String(countCommitted(outcomes)),
                                total: String(rows.length),
                            })}
                        </Text>
                        <OutcomesSummary outcomes={outcomes} />
                    </React.Fragment>
                )}
            </Flex>
        );
        return [
            {name: 'summary', type: 'block', extras: {children: status}},
            ...(gate.requiresForce
                ? [
                      {
                          name: 'force' as const,
                          type: 'checkbox' as const,
                          extras: {children: i18n('label_force')},
                      },
                  ]
                : []),
        ];
    }, [
        gate.blocked,
        gate.requiresForce,
        outcomes,
        permissionError,
        permissionReady,
        pipelineStateError,
        rows,
        stateReady,
    ]);

    const handleClose = (form: FormApi<FormValues>) => {
        if (form.getState().submitting && !allowAutomaticSuccessCloseRef.current) {
            return;
        }
        allowAutomaticSuccessCloseRef.current = false;
        onClose();
    };

    return (
        <YTDFDialog<FormValues>
            key={`${visible ? 'open' : 'closed'}:${rows.map(getStateRowId).join('|')}`}
            visible={visible}
            size="m"
            headerProps={{title: i18n('title_delete-states')}}
            footerProps={{
                textApply: i18n('action_delete'),
                textCancel: i18n('action_cancel'),
                propsButtonApply: {view: 'outlined-danger'},
            }}
            pristineSubmittable
            initialValues={{force: false}}
            fields={fields}
            isApplyDisabled={({values, submitting}) =>
                submitting ||
                !stateReady ||
                !permissionReady ||
                gate.blocked ||
                rows.length === 0 ||
                (gate.requiresForce && !values.force)
            }
            onAdd={async (form) => {
                const result = await runDeleteStates(Boolean(form.getState().values.force));
                if (result.status !== 'completed') {
                    return makeFormSubmitError({message: i18n('alert_delete-failed')});
                }
                const allCommitted = areAllCommitted(result.outcomes, rows.length);
                setOutcomes(result.outcomes);
                if (countCommitted(result.outcomes) > 0) {
                    onCommitted(result.outcomes, allCommitted);
                }
                if (!allCommitted) {
                    return makeFormSubmitError({message: i18n('alert_delete-failed')});
                }
                allowAutomaticSuccessCloseRef.current = true;
                return undefined;
            }}
            onClose={handleClose}
        />
    );
}
