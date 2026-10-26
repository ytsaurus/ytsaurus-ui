import React from 'react';
import cn from 'bem-cn-lite';

import {Alert, Flex} from '@gravity-ui/uikit';

import {type tanstack} from '../../../../../components/DataTableGravity';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {useCheckPermissionQuery} from '../../../../../store/api/yt/checkPermissions';
import {selectCurrentUserName} from '../../../../../store/selectors/global';

import {useSelector} from '../../../../../store/redux-hooks';

import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog/FlowDeleteStatesDialog';
import {FlowStateFilters} from '../FlowStateFilters/FlowStateFilters';
import {FlowStateResults, FlowStateResultsActions} from '../FlowStateResults/FlowStateResults';
import {flattenReadStatesResponse} from '../state-requests';
import {seedStateFilters} from '../state-filter-options';
import {resolveKeySchema} from '../state-schema';
import {toPersistedStateFilters} from '../state-url-filters';
import {isDeleteCommitted, isWriteDeniedByPermission} from '../state-delete';
import {useFlowStateCellHandlers} from './use-flow-state-cell-handlers';
import {useFlowStateRead} from './use-flow-state-read';
import i18n from './i18n';
import type {
    FlowRowDeleteOutcome,
    FlowStateFiltersValue,
    FlowStatePersistedFilters,
    FlowStateResultRow,
} from '../types';

import './FlowStateSection.scss';

const block = cn('yt-flow-state-section');

export type FlowStateSectionProps = {
    pipeline_path: string;
    fixedComputationId?: string;
    initialFilters?: Partial<FlowStateFiltersValue>;
    restoredFilters?: Partial<FlowStateFiltersValue>;
    restoredUrlMalformed?: boolean;
    onFiltersChange?: (persisted: FlowStatePersistedFilters) => void;
};

export function FlowStateSection({
    pipeline_path,
    fixedComputationId,
    initialFilters,
    restoredFilters,
    restoredUrlMalformed,
    onFiltersChange,
}: FlowStateSectionProps) {
    const [rowSelection, setRowSelection] = React.useState<tanstack.RowSelectionState>({});
    const [deleteRows, setDeleteRows] = React.useState<Array<FlowStateResultRow>>();
    const [deleteVisible, setDeleteVisible] = React.useState(false);
    const login = useSelector(selectCurrentUserName);

    const {
        filters,
        setFilters,
        staticSpec,
        staticSpecResolved,
        hasScope,
        validationError,
        response,
        initialLoading,
        refreshing,
        readSucceeded,
        error,
        refetch,
    } = useFlowStateRead({
        pipeline_path,
        fixedComputationId,
        initialFilters,
        restoredFilters,
        restoredUrlMalformed,
    });

    const permissionResult = useCheckPermissionQuery({
        id: YTApiId.checkPermissions,
        parameters: {path: pipeline_path, user: login, permission: 'write'},
    });
    const writeDenied = isWriteDeniedByPermission(permissionResult);
    const rawKeyAvailable = React.useMemo(
        () =>
            flattenReadStatesResponse(response).some(
                (row) =>
                    row.computationId === filters.computationId &&
                    row.key !== undefined &&
                    row.key !== null,
            ),
        [filters.computationId, response],
    );

    const [mirrorDeferred, setMirrorDeferred] = React.useState(false);
    const mirrorFilters = React.useCallback(
        (next: FlowStateFiltersValue) => {
            onFiltersChange?.(
                toPersistedStateFilters(
                    next,
                    resolveKeySchema(staticSpec, next.computationId, next.stateName, next.target)
                        .keyColumns,
                ),
            );
        },
        [onFiltersChange, staticSpec],
    );

    const handleFiltersChange = React.useCallback(
        (next: FlowStateFiltersValue) => {
            setFilters(next);
            setRowSelection({});
            const keySerializationNeedsSchema =
                next.keyText === undefined && Object.keys(next.keyValues).length > 0;
            if (keySerializationNeedsSchema && !staticSpecResolved) {
                setMirrorDeferred(true);
                return;
            }
            setMirrorDeferred(false);
            mirrorFilters(next);
        },
        [mirrorFilters, setFilters, staticSpecResolved],
    );

    React.useEffect(() => {
        if (mirrorDeferred && staticSpecResolved) {
            setMirrorDeferred(false);
            mirrorFilters(filters);
        }
    }, [filters, mirrorDeferred, mirrorFilters, staticSpecResolved]);

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
        _allCommitted: boolean,
    ) => {
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
        refetch();
    };

    return (
        <React.Fragment>
            <Flex direction="column" gap={4} className={block()}>
                <FlowStateFilters
                    pipeline_path={pipeline_path}
                    value={filters}
                    onChange={handleFiltersChange}
                    onReset={handleReset}
                    fixedComputationId={fixedComputationId}
                    staticSpec={staticSpec}
                    rawKeyAvailable={rawKeyAvailable}
                    actions={
                        <FlowStateResultsActions
                            response={response}
                            refreshing={refreshing}
                            hasScope={hasScope}
                            initialLoading={initialLoading}
                            readSucceeded={readSucceeded}
                            error={error}
                        />
                    }
                />
                <Flex direction="column" gap={3}>
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
                </Flex>
            </Flex>
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
