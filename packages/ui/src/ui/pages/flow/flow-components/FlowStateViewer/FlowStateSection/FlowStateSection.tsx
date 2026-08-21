import React from 'react';
import cn from 'bem-cn-lite';

import {Alert} from '@gravity-ui/uikit';

import {type tanstack} from '../../../../../components/DataTableGravity';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {useCheckPermissionQuery} from '../../../../../store/api/yt/checkPermissions';
import {selectCurrentUserName} from '../../../../../store/selectors/global';

import {useSelector} from '../../../../../store/redux-hooks';

import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog/FlowDeleteStatesDialog';
import {FlowStateFilters} from '../FlowStateFilters/FlowStateFilters';
import {FlowStateResults} from '../FlowStateResults/FlowStateResults';
import {seedStateFilters} from '../state-filters';
import {isDeleteCommitted, isWriteDeniedByPermission} from '../state-delete';
import {useFlowStateCellHandlers} from './use-flow-state-cell-handlers';
import {useFlowStateRead} from './use-flow-state-read';
import i18n from './i18n';
import type {FlowRowDeleteOutcome, FlowStateFiltersValue, FlowStateResultRow} from '../types';

import './FlowStateSection.scss';

const block = cn('yt-flow-state-section');

export type FlowStateSectionProps = {
    pipeline_path: string;
    fixedComputationId?: string;
    initialFilters?: Partial<FlowStateFiltersValue>;
};

export function FlowStateSection({
    pipeline_path,
    fixedComputationId,
    initialFilters,
}: FlowStateSectionProps) {
    const [rowSelection, setRowSelection] = React.useState<tanstack.RowSelectionState>({});
    const [deleteRows, setDeleteRows] = React.useState<Array<FlowStateResultRow>>();
    const [deleteVisible, setDeleteVisible] = React.useState(false);
    const login = useSelector(selectCurrentUserName);

    const {
        filters,
        setFilters,
        staticSpec,
        hasScope,
        validationError,
        response,
        initialLoading,
        refreshing,
        readSucceeded,
        error,
        refetch,
    } = useFlowStateRead({pipeline_path, fixedComputationId, initialFilters});

    const permissionResult = useCheckPermissionQuery({
        id: YTApiId.checkPermissions,
        parameters: {path: pipeline_path, user: login, permission: 'write'},
    });
    const writeDenied = isWriteDeniedByPermission(permissionResult);

    const handleFiltersChange = React.useCallback(
        (next: FlowStateFiltersValue) => {
            setFilters(next);
            setRowSelection({});
        },
        [setFilters],
    );

    const handleReset = () => {
        handleFiltersChange(seedStateFilters(fixedComputationId, initialFilters));
    };

    const cellHandlers = useFlowStateCellHandlers({
        pipeline_path,
        filters,
        staticSpec,
        fixedComputationId,
        onFiltersChange: handleFiltersChange,
    });

    const handleDeleteRows = (nextRows: Array<FlowStateResultRow>) => {
        if (refreshing) {
            return;
        }
        setDeleteRows(nextRows);
        setDeleteVisible(true);
    };

    const handleDeleteCommitted = (
        outcomes: Array<FlowRowDeleteOutcome>,
        allCommitted: boolean,
    ) => {
        if (allCommitted) {
            setRowSelection({});
        } else {
            const committedRowIds = new Set(
                outcomes
                    .filter(
                        (outcome) =>
                            outcome.response !== undefined && isDeleteCommitted(outcome.response),
                    )
                    .map(({rowId}) => rowId),
            );
            setRowSelection((current) =>
                Object.fromEntries(
                    Object.entries(current).filter(([rowId]) => !committedRowIds.has(rowId)),
                ),
            );
        }
        refetch();
    };

    return (
        <React.Fragment>
            <div className={block()}>
                <FlowStateFilters
                    pipeline_path={pipeline_path}
                    value={filters}
                    onChange={handleFiltersChange}
                    onReset={handleReset}
                    fixedComputationId={fixedComputationId}
                    staticSpec={staticSpec}
                />
                <div className={block('content')}>
                    {!hasScope && <Alert theme="info" message={i18n('alert_pick-scope')} />}
                    {validationError && <Alert theme="warning" message={validationError} />}
                    <FlowStateResults
                        hasScope={hasScope}
                        response={response}
                        initialLoading={initialLoading}
                        refreshing={refreshing}
                        readSucceeded={readSucceeded}
                        error={error}
                        handlers={cellHandlers}
                        rowSelection={rowSelection}
                        onRowSelectionChange={setRowSelection}
                        writeDenied={writeDenied}
                        onDeleteRows={handleDeleteRows}
                    />
                </div>
            </div>
            {deleteRows && (
                <FlowDeleteStatesDialog
                    visible={deleteVisible}
                    onClose={() => setDeleteVisible(false)}
                    pipeline_path={pipeline_path}
                    rows={deleteRows}
                    permission={permissionResult}
                    onCommitted={handleDeleteCommitted}
                />
            )}
        </React.Fragment>
    );
}
