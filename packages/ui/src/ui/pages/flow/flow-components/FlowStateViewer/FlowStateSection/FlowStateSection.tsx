import React from 'react';
import cn from 'bem-cn-lite';

import {Alert} from '@gravity-ui/uikit';
import {skipToken} from '@reduxjs/toolkit/query';

import {type tanstack} from '../../../../../components/DataTableGravity';
import {useDebouncedValue} from '../../../../../hooks/useDebouncedValue';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {useCheckPermissionQuery} from '../../../../../store/api/yt/checkPermissions';
import {useFlowReadStatesQuery, useFlowStaticSpecQuery} from '../../../../../store/api/yt/flow';
import {FlowTab} from '../../../../../store/reducers/flow/filters';
import {selectCluster, selectCurrentUserName} from '../../../../../store/selectors/global';
import {makeFlowLink} from '../../../../../utils/app-url/makeFlowLink';

import {useSelector} from '../../../../../store/redux-hooks';

import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog/FlowDeleteStatesDialog';
import {FlowStateFilters} from '../FlowStateFilters/FlowStateFilters';
import {FlowStateResults} from '../FlowStateResults/FlowStateResults';
import {
    AUTO_LOAD_DEBOUNCE_MS,
    buildStateReadBody,
    flattenReadStatesResponse,
    selectDeletableRows,
} from '../state-requests';
import {
    getComputationStateNames,
    resolveKeySchema,
    resolveRowKeySchema,
    seedStateFilters,
} from '../state-filters';
import {buildRowFilterUpdate, resolveStateStoragePath} from '../state-values';
import {isWriteDeniedByPermission} from '../state-delete';
import i18n from './i18n';
import type {
    FlowStateCellHandlers,
    FlowStateFiltersValue,
    FlowStateResultRow,
    FlowStateRowFilterField,
} from '../types';

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
    const [filters, setFilters] = React.useState<FlowStateFiltersValue>(() =>
        seedStateFilters(fixedComputationId, initialFilters),
    );
    const [rowSelection, setRowSelection] = React.useState<tanstack.RowSelectionState>({});
    const [deleteRows, setDeleteRows] = React.useState<Array<FlowStateResultRow>>();
    const [deleteVisible, setDeleteVisible] = React.useState(false);
    const login = useSelector(selectCurrentUserName);
    const cluster = useSelector(selectCluster);

    const {data: staticSpec} = useFlowStaticSpecQuery({parameters: {pipeline_path}});
    const permissionResult = useCheckPermissionQuery({
        id: YTApiId.checkPermissions,
        parameters: {path: pipeline_path, user: login, permission: 'write'},
    });
    const writeDenied = isWriteDeniedByPermission(permissionResult);

    const hasScope = Boolean(filters.computationId || filters.partitionId);
    const debouncedFilters = useDebouncedValue(filters, AUTO_LOAD_DEBOUNCE_MS);
    const hasDebouncedScope = Boolean(
        debouncedFilters.computationId || debouncedFilters.partitionId,
    );
    const built = hasDebouncedScope
        ? buildStateReadBody(
              debouncedFilters,
              resolveKeySchema(
                  staticSpec,
                  debouncedFilters.computationId,
                  debouncedFilters.stateName,
                  debouncedFilters.target,
              ),
          )
        : undefined;
    const validationError =
        built && 'error' in built ? i18n(built.error.errorKey, built.error.params) : undefined;
    const {
        data,
        error,
        isFetching: loading,
        refetch,
    } = useFlowReadStatesQuery(
        built && 'body' in built
            ? {parameters: {pipeline_path}, body: {...built.body, limit: debouncedFilters.limit}}
            : skipToken,
    );
    const response = hasDebouncedScope ? data : undefined;

    React.useEffect(() => {
        setRowSelection({});
    }, [response]);

    const rows = React.useMemo(() => flattenReadStatesResponse(response), [response]);
    const selectedRows = React.useMemo(
        () => selectDeletableRows(rows, rowSelection),
        [rows, rowSelection],
    );

    const handleFiltersChange = React.useCallback((next: FlowStateFiltersValue) => {
        setFilters(next);
        setRowSelection({});
    }, []);

    const handleReset = () => {
        handleFiltersChange(seedStateFilters(fixedComputationId, initialFilters));
    };

    const getRowFilterUpdate = React.useCallback(
        (row: FlowStateResultRow, field: FlowStateRowFilterField) =>
            buildRowFilterUpdate(filters, row, field, {
                ...resolveRowKeySchema(staticSpec, row),
                stateNames: getComputationStateNames(
                    staticSpec,
                    filters.computationId,
                    row.section === 'joined_external_key_state' ? 'all' : row.section,
                ),
                fixedComputationId,
            }),
        [filters, staticSpec, fixedComputationId],
    );

    const resolveStoragePath = React.useCallback(
        (row: FlowStateResultRow) => resolveStateStoragePath(row, pipeline_path, staticSpec),
        [pipeline_path, staticSpec],
    );

    const resolveComputationLink = React.useCallback(
        (computationId: string) =>
            makeFlowLink({
                path: pipeline_path,
                cluster,
                tab: FlowTab.COMPUTATIONS,
                computation: computationId,
            }),
        [pipeline_path, cluster],
    );

    const cellHandlers = React.useMemo<FlowStateCellHandlers>(
        () => ({
            getRowFilterUpdate,
            onFiltersChange: handleFiltersChange,
            resolveStoragePath,
            resolveComputationLink,
        }),
        [getRowFilterUpdate, handleFiltersChange, resolveStoragePath, resolveComputationLink],
    );

    const handleDeleteSelected = () => {
        setDeleteRows(selectedRows);
        setDeleteVisible(true);
    };

    const handleDeleteCommitted = () => {
        setRowSelection({});
        refetch();
    };

    return (
        <div className={block()}>
            <FlowStateFilters
                pipeline_path={pipeline_path}
                value={filters}
                onChange={handleFiltersChange}
                onReset={handleReset}
                fixedComputationId={fixedComputationId}
                staticSpec={staticSpec}
            />
            {!hasScope && <Alert theme="info" message={i18n('alert_pick-scope')} />}
            {validationError && <Alert theme="warning" message={validationError} />}
            <FlowStateResults
                response={response}
                loading={loading}
                error={error}
                handlers={cellHandlers}
                rowSelection={rowSelection}
                onRowSelectionChange={setRowSelection}
                writeDenied={writeDenied}
                onDeleteSelected={handleDeleteSelected}
            />
            {deleteRows && (
                <FlowDeleteStatesDialog
                    visible={deleteVisible}
                    onClose={() => setDeleteVisible(false)}
                    pipeline_path={pipeline_path}
                    rows={deleteRows}
                    onCommitted={handleDeleteCommitted}
                />
            )}
        </div>
    );
}

export default FlowStateSection;
