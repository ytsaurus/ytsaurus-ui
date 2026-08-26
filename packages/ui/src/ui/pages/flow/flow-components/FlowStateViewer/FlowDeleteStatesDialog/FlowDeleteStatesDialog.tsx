import React from 'react';

import {Alert, Checkbox, Flex, Loader, Text} from '@gravity-ui/uikit';

import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';
import {DialogWrapper} from '../../../../../components/DialogWrapper/DialogWrapper';

import {
    type FlowDeletePermissionQuery,
    areAllCommitted,
    countCommitted,
    isDeleteCommitted,
} from '../state-delete';
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

function mergeDeleteOutcomes(
    rows: Array<FlowStateResultRow>,
    currentOutcomes: Array<FlowRowDeleteOutcome>,
    attemptOutcomes: Array<FlowRowDeleteOutcome>,
): Array<FlowRowDeleteOutcome> {
    const currentByRowId = new Map(currentOutcomes.map((outcome) => [outcome.rowId, outcome]));
    const attemptByRowId = new Map(attemptOutcomes.map((outcome) => [outcome.rowId, outcome]));
    return rows.flatMap((row) => {
        const rowId = getStateRowId(row);
        const current = currentByRowId.get(rowId);
        const next =
            current?.response && isDeleteCommitted(current.response)
                ? current
                : (attemptByRowId.get(rowId) ?? current);
        return next ? [next] : [];
    });
}

export function FlowDeleteStatesDialog({
    visible,
    onClose,
    pipeline_path,
    rows,
    permission,
    onCommitted,
}: FlowDeleteStatesDialogProps) {
    const titleId = React.useId();
    const [force, setForce] = React.useState(false);
    const [submitting, setSubmitting] = React.useState(false);
    const [submitError, setSubmitError] = React.useState<string>();
    const [outcomes, setOutcomes] = React.useState<Array<FlowRowDeleteOutcome>>();
    const committedRowIds = React.useMemo(
        () =>
            new Set(
                (outcomes ?? [])
                    .filter(
                        (outcome) =>
                            outcome.response !== undefined && isDeleteCommitted(outcome.response),
                    )
                    .map((outcome) => outcome.rowId),
            ),
        [outcomes],
    );
    const retryRows = React.useMemo(
        () => rows.filter((row) => !committedRowIds.has(getStateRowId(row))),
        [committedRowIds, rows],
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
            setForce(false);
            setSubmitting(false);
            setSubmitError(undefined);
            setOutcomes(undefined);
        }
    }, [visible, rows]);

    const handleClose = () => {
        if (submitting) {
            return;
        }
        onClose();
    };

    const handleApply = async () => {
        setSubmitting(true);
        setSubmitError(undefined);
        const result = await runDeleteStates(force);
        if (result.status === 'stale') {
            return;
        }
        if (result.status !== 'completed') {
            setSubmitting(false);
            setSubmitError(i18n('alert_delete-failed'));
            return;
        }
        const nextOutcomes = mergeDeleteOutcomes(rows, outcomes ?? [], result.outcomes);
        const allCommitted = areAllCommitted(nextOutcomes, rows.length);
        setOutcomes(nextOutcomes);
        setSubmitting(false);
        if (countCommitted(result.outcomes) > 0) {
            onCommitted(result.outcomes, allCommitted);
        }
        if (allCommitted) {
            onClose();
            return;
        }
        setSubmitError(i18n('alert_delete-failed'));
    };

    const applyDisabled =
        submitting ||
        !stateReady ||
        !permissionReady ||
        gate.blocked ||
        rows.length === 0 ||
        (gate.requiresForce && !force);

    return (
        <DialogWrapper open={visible} size="m" aria-labelledby={titleId} onClose={handleClose}>
            <DialogWrapper.Header caption={i18n('title_delete-states')} id={titleId} />
            <DialogWrapper.Body>
                <Flex direction="column" gap={3}>
                    <RowsSummary rows={rows} />
                    {!stateReady &&
                        (pipelineStateError ? (
                            <YTErrorBlock
                                error={pipelineStateError as YTErrorBlockProps['error']}
                            />
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
                        <React.Fragment>
                            <Alert theme="warning" message={i18n('alert_force-paused')} />
                            <Checkbox checked={force} onUpdate={setForce}>
                                {i18n('label_force')}
                            </Checkbox>
                        </React.Fragment>
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
            </DialogWrapper.Body>
            <DialogWrapper.Footer
                preset="default"
                textButtonApply={i18n('action_delete')}
                textButtonCancel={i18n('action_cancel')}
                propsButtonApply={{view: 'outlined-danger', disabled: applyDisabled}}
                onClickButtonApply={handleApply}
                onClickButtonCancel={handleClose}
                loading={submitting}
                errorText={submitError}
                showError={submitError !== undefined}
            />
        </DialogWrapper>
    );
}
