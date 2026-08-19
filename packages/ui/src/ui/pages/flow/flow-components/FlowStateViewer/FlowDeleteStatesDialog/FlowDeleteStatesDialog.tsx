import React from 'react';

import {Button, Dialog, Flex} from '@gravity-ui/uikit';

import {DeleteStatesStatus} from './DeleteStatesStatus';
import {RowsSummary} from './RowsSummary';
import {useFlowDeleteStates} from './use-flow-delete-states';
import i18n from './i18n';
import type {FlowStateResultRow} from '../types';

export type FlowDeleteStatesDialogProps = {
    visible: boolean;
    onClose: () => void;
    pipeline_path: string;
    rows: Array<FlowStateResultRow>;
    onCommitted: () => void;
};

export function FlowDeleteStatesDialog({
    visible,
    onClose,
    pipeline_path,
    rows,
    onCommitted,
}: FlowDeleteStatesDialogProps) {
    const {
        force,
        busy,
        preview,
        committed,
        failed,
        error,
        pipelineStateError,
        gate,
        stateReady,
        canPreview,
        canDelete,
        deleting,
        setForce,
        runDeleteStates,
    } = useFlowDeleteStates({visible, pipeline_path, rows, onCommitted});

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
                    <DeleteStatesStatus
                        committed={committed}
                        stateReady={stateReady}
                        gate={gate}
                        force={force}
                        onForceChange={setForce}
                        preview={preview}
                        failed={failed}
                        error={error}
                        pipelineStateError={pipelineStateError}
                        totalRows={rows.length}
                    />
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
