import React from 'react';

import {Alert, Checkbox, Loader, Text} from '@gravity-ui/uikit';

import {YTErrorBlock, type YTErrorBlockProps} from '../../../../../containers/Block/Block';

import {countCommitted} from '../state-delete';
import {OutcomesSummary} from './OutcomesSummary';
import i18n from './i18n';
import type {FlowRowDeleteOutcome} from '../types';

export function DeleteStatesStatus({
    committed,
    stateReady,
    gate,
    force,
    onForceChange,
    preview,
    failed,
    error,
    pipelineStateError,
    totalRows,
}: {
    committed?: Array<FlowRowDeleteOutcome>;
    stateReady: boolean;
    gate: {blocked: boolean; requiresForce: boolean};
    force: boolean;
    onForceChange: (force: boolean) => void;
    preview?: Array<FlowRowDeleteOutcome>;
    failed?: Array<FlowRowDeleteOutcome>;
    error?: unknown;
    pipelineStateError?: unknown;
    totalRows: number;
}) {
    if (committed) {
        return (
            <React.Fragment>
                <Alert theme="success" message={i18n('text_committed')} />
                <OutcomesSummary outcomes={committed} />
            </React.Fragment>
        );
    }
    if (!stateReady) {
        return pipelineStateError ? (
            <YTErrorBlock error={pipelineStateError as YTErrorBlockProps['error']} />
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
                    <Checkbox checked={force} onUpdate={onForceChange}>
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
                            total: String(totalRows),
                        })}
                    </Text>
                    <OutcomesSummary outcomes={failed} />
                </React.Fragment>
            )}
            {error ? <YTErrorBlock error={error as YTErrorBlockProps['error']} /> : null}
        </React.Fragment>
    );
}
