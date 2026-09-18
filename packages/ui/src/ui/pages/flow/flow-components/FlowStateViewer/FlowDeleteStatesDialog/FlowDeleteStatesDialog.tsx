import React from 'react';

import {Alert, Checkbox, Flex, Loader, Text} from '@gravity-ui/uikit';

import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';
import {YTDFDialog} from '../../../../../containers/Dialog';

import {
    type FlowDeletePermissionQuery,
    areAllCommitted,
    countCommitted,
    getRowsPendingDelete,
    mergeDeleteOutcomes,
} from '../state-delete';
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

export function FlowDeleteStatesDialog({
    visible,
    onClose,
    pipeline_path,
    rows,
    permission,
    onCommitted,
}: FlowDeleteStatesDialogProps) {
    const [irreversibleAcknowledged, setIrreversibleAcknowledged] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string>();
    const [outcomes, setOutcomes] = React.useState<Array<FlowRowDeleteOutcome>>();
    const retryRows = React.useMemo(
        () => getRowsPendingDelete(rows, outcomes ?? []),
        [outcomes, rows],
    );
    const {
        gate,
        stateReady,
        permissionReady,
        pipelineStateError,
        permissionError,
        runDeleteStates,
    } = useFlowDeleteStates({visible, pipeline_path, rows: retryRows, permission});

    React.useEffect(() => {
        if (visible) {
            setIrreversibleAcknowledged(false);
            setSubmitError(undefined);
            setOutcomes(undefined);
        }
    }, [visible, rows]);

    const handleApply = async () => {
        setSubmitting(true);
        setSubmitError(undefined);
        try {
            const result = await runDeleteStates(gate.requiresForce && irreversibleAcknowledged);
            if (result.status === 'stale') {
                return {validationErrors: {}};
            }
            if (result.status !== 'completed') {
                setSubmitError(i18n('alert_delete-failed'));
                return {validationErrors: {}};
            }
            const nextOutcomes = mergeDeleteOutcomes(rows, outcomes ?? [], result.outcomes);
            const allCommitted = areAllCommitted(nextOutcomes, rows.length);
            setOutcomes(nextOutcomes);
            if (countCommitted(result.outcomes) > 0) {
                onCommitted(result.outcomes, allCommitted);
            }
            if (allCommitted) {
                onClose();
            } else {
                setSubmitError(i18n('alert_delete-failed'));
            }
            return {validationErrors: {}};
        } finally {
            setSubmitting(false);
        }
    };

    const applyDisabled =
        !stateReady ||
        !permissionReady ||
        gate.blocked ||
        rows.length === 0 ||
        (gate.requiresForce && !irreversibleAcknowledged);

    return (
        <YTDFDialog
            visible={visible}
            size="l"
            pristineSubmittable
            headerProps={{title: i18n('title_delete-states')}}
            footerProps={{
                textApply: i18n('action_delete'),
                textCancel: i18n('action_cancel'),
                propsButtonApply: {view: 'outlined-danger', loading: submitting},
                propsButtonCancel: {disabled: submitting},
            }}
            isApplyDisabled={() => applyDisabled}
            onAdd={handleApply}
            onClose={(form) => {
                if (!form.getState().submitting) {
                    onClose();
                }
            }}
            fields={[
                {
                    name: 'delete-states',
                    type: 'block',
                    fullWidth: true,
                    extras: {
                        children: (
                            <Flex direction="column" gap={3}>
                                <RowsSummary rows={rows} />
                                {!stateReady &&
                                    !submitting &&
                                    (pipelineStateError ? (
                                        <YTErrorBlock
                                            error={pipelineStateError as YTErrorBlockProps['error']}
                                        />
                                    ) : (
                                        <Loader size="m" />
                                    ))}
                                {!permissionReady &&
                                    (permissionError ? (
                                        <YTErrorBlock
                                            error={permissionError as YTErrorBlockProps['error']}
                                        />
                                    ) : (
                                        <Alert
                                            theme="warning"
                                            message={i18n('alert_permission-unavailable')}
                                        />
                                    ))}
                                {(stateReady || submitting) && gate.blocked && (
                                    <Alert
                                        theme="warning"
                                        message={i18n('alert_pipeline-running')}
                                    />
                                )}
                                {(stateReady || submitting) && gate.requiresForce && (
                                    <Checkbox
                                        checked={irreversibleAcknowledged}
                                        onUpdate={setIrreversibleAcknowledged}
                                    >
                                        {i18n('label_force')}
                                    </Checkbox>
                                )}
                                {submitError && <Alert theme="danger" message={submitError} />}
                                {outcomes && !areAllCommitted(outcomes, rows.length) && (
                                    <React.Fragment>
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
                        ),
                    },
                },
            ]}
        />
    );
}
