import React from 'react';

import {Alert, Button, Checkbox, Dialog, Flex, Loader, Text} from '@gravity-ui/uikit';

import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';

import {KIND_LABEL_KEYS} from '../FlowStateResults/FlowStateResults';
import {fetchPipelineState, flowDeleteStates} from '../flow-state-api';
import {
    CLOSED_DELETE_DIALOG_STATE,
    aggregateMatchedTotal,
    countCommitted,
    deleteStatesGate,
    flowDeleteDialogReducer,
    getStateRowId,
    isDeletePreviewCommittable,
    runRowDeletes,
    stringifyStateValue,
} from '../helpers';
import i18n from './i18n';
import i18nApiValues from '../i18n-api-values';
import type {FlowRowDeleteOutcome, FlowStateResultRow} from '../types';

const MAX_LISTED_ROWS = 20;

export type FlowDeleteStatesDialogProps = {
    visible: boolean;
    onClose: () => void;
    pipeline_path: string;
    rows: Array<FlowStateResultRow>;
    onCommitted: () => void;
};

function RowsSummary({rows}: {rows: Array<FlowStateResultRow>}) {
    const listed = rows.slice(0, MAX_LISTED_ROWS);
    return (
        <Flex direction="column" gap={1}>
            <Alert
                theme="warning"
                message={i18n('text_delete-selected-explanation', {count: String(rows.length)})}
            />
            {listed.map((row) => (
                <Flex key={getStateRowId(row)} gap={2} wrap>
                    <Text color="secondary">{i18nApiValues(KIND_LABEL_KEYS[row.section])}</Text>
                    <Text>{row.computationId ?? ''}</Text>
                    {row.partitionId !== undefined && <Text>{row.partitionId}</Text>}
                    {row.key !== undefined && <Text>{stringifyStateValue(row.key)}</Text>}
                    <Text>{row.stateName}</Text>
                </Flex>
            ))}
            {rows.length > MAX_LISTED_ROWS && (
                <Text color="secondary">
                    {i18n('text_and-n-more', {count: String(rows.length - MAX_LISTED_ROWS)})}
                </Text>
            )}
        </Flex>
    );
}

function OutcomesSummary({outcomes}: {outcomes: Array<FlowRowDeleteOutcome>}) {
    return (
        <Flex direction="column" gap={1}>
            <Text variant="subheader-2">
                {i18n('text_matched-total')}: {aggregateMatchedTotal(outcomes)}
            </Text>
            {outcomes.map(({rowId, response, error}) => (
                <React.Fragment key={rowId}>
                    {error !== undefined && (
                        <YTErrorBlock error={error as YTErrorBlockProps['error']} />
                    )}
                    {(response?.errors ?? []).map((message, index) => (
                        <YTErrorBlock key={`${index}:${message}`} error={{message}} />
                    ))}
                </React.Fragment>
            ))}
        </Flex>
    );
}

export function FlowDeleteStatesDialog({
    visible,
    onClose,
    pipeline_path,
    rows,
    onCommitted,
}: FlowDeleteStatesDialogProps) {
    const [dialog, dispatch] = React.useReducer(
        flowDeleteDialogReducer,
        CLOSED_DELETE_DIALOG_STATE,
    );
    const sessionRef = React.useRef(0);

    React.useEffect(() => {
        const session = ++sessionRef.current;
        if (!visible) {
            dispatch({type: 'closed', session});
            return;
        }
        dispatch({type: 'opened', session});
        fetchPipelineState(pipeline_path)
            .then((pipelineState) =>
                dispatch({type: 'pipeline-state-loaded', session, pipelineState}),
            )
            .catch((reason) => dispatch({type: 'request-failed', session, error: reason}));
    }, [visible, pipeline_path]);

    const {force, busy, preview, previewSnapshot, committed, failed, error} = dialog;
    const gate = deleteStatesGate(dialog.pipelineState);
    const stateReady = dialog.pipelineState !== undefined;
    const bodyKey = JSON.stringify(rows.map(getStateRowId));
    const previewValid = isDeletePreviewCommittable(preview, previewSnapshot, bodyKey, force);
    const canPreview = stateReady && !gate.blocked && busy === undefined && rows.length > 0;
    const canDelete =
        previewValid && !gate.blocked && (!gate.requiresForce || force) && busy === undefined;
    const deleting = busy === 'delete';

    const runDeleteStates = (commit: boolean) => {
        const session = sessionRef.current;
        dispatch({type: 'run-started', commit});
        runRowDeletes(rows, (body) => flowDeleteStates(pipeline_path, body), {
            force,
            commit,
            isCancelled: () => sessionRef.current !== session,
        }).then((outcomes) => {
            dispatch(
                commit
                    ? {type: 'delete-finished', session, outcomes, expected: rows.length}
                    : {type: 'preview-loaded', session, outcomes, snapshot: {bodyKey, force}},
            );
            if (commit && countCommitted(outcomes) > 0) {
                onCommitted();
            }
        });
    };

    const renderStatus = () => {
        if (committed) {
            return (
                <React.Fragment>
                    <Alert theme="success" message={i18n('text_committed')} />
                    <OutcomesSummary outcomes={committed} />
                </React.Fragment>
            );
        }
        if (!stateReady) {
            return error ? (
                <YTErrorBlock error={error as YTErrorBlockProps['error']} />
            ) : (
                <Loader size="m" />
            );
        }
        return (
            <React.Fragment>
                {gate.blocked && <Alert theme="warning" message={i18n('alert_pipeline-running')} />}
                {gate.requiresForce && (
                    <React.Fragment>
                        <Alert theme="warning" message={i18n('alert_force-paused')} />
                        <Checkbox
                            checked={force}
                            onUpdate={(next) => dispatch({type: 'force-changed', force: next})}
                        >
                            {i18n('label_force')}
                        </Checkbox>
                    </React.Fragment>
                )}
                {preview && (
                    <React.Fragment>
                        <Alert theme="info" message={i18n('text_preview-only')} />
                        <OutcomesSummary outcomes={preview} />
                    </React.Fragment>
                )}
                {failed && (
                    <React.Fragment>
                        <Alert theme="danger" message={i18n('alert_delete-failed')} />
                        <Text>
                            {i18n('text_deleted-count', {
                                done: String(countCommitted(failed)),
                                total: String(rows.length),
                            })}
                        </Text>
                        <OutcomesSummary outcomes={failed} />
                    </React.Fragment>
                )}
                {error ? <YTErrorBlock error={error as YTErrorBlockProps['error']} /> : null}
            </React.Fragment>
        );
    };

    return (
        <Dialog
            open={visible}
            onClose={() => {
                if (!deleting) {
                    onClose();
                }
            }}
            disableOutsideClick={deleting}
            disableEscapeKeyDown={deleting}
            size="m"
        >
            <Dialog.Header caption={i18n('title_delete-states')} />
            <Dialog.Body>
                <Flex direction="column" gap={3}>
                    <RowsSummary rows={rows} />
                    {renderStatus()}
                    {committed ? (
                        <Flex justifyContent="flex-end">
                            <Button onClick={() => onClose()}>{i18n('action_close')}</Button>
                        </Flex>
                    ) : (
                        <Flex gap={2} justifyContent="flex-end">
                            <Button view="flat" disabled={deleting} onClick={() => onClose()}>
                                {i18n('action_cancel')}
                            </Button>
                            <Button
                                disabled={!canPreview}
                                loading={busy === 'preview'}
                                onClick={() => runDeleteStates(false)}
                            >
                                {i18n('action_preview')}
                            </Button>
                            <Button
                                view="outlined-danger"
                                disabled={!canDelete}
                                loading={busy === 'delete'}
                                onClick={() => runDeleteStates(true)}
                            >
                                {i18n('action_delete')}
                            </Button>
                        </Flex>
                    )}
                </Flex>
            </Dialog.Body>
        </Dialog>
    );
}

export default FlowDeleteStatesDialog;
