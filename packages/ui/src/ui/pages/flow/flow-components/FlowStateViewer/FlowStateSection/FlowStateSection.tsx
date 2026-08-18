import React from 'react';
import cn from 'bem-cn-lite';

import {Alert} from '@gravity-ui/uikit';

import {type tanstack} from '../../../../../components/DataTableGravity';
import WithStickyToolbar from '../../../../../components/WithStickyToolbar/WithStickyToolbar';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {useCheckPermissionQuery} from '../../../../../store/api/yt/checkPermissions';
import {selectCurrentUserName} from '../../../../../store/selectors/global';

import {useSelector} from '../../../../../store/redux-hooks';

import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog/FlowDeleteStatesDialog';
import {FlowStateFilters} from '../FlowStateFilters/FlowStateFilters';
import {FlowStateResults} from '../FlowStateResults/FlowStateResults';
import {flattenReadStatesResponse, selectDeletableRows} from '../state-requests';
import {seedStateFilters} from '../state-filters';
import {isWriteDeniedByPermission} from '../state-delete';
import {useFlowStateCellHandlers} from './use-flow-state-cell-handlers';
import {useFlowStateRead} from './use-flow-state-read';
import i18n from './i18n';
import type {FlowStateFiltersValue, FlowStateResultRow} from '../types';

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
        loading,
        error,
        refetch,
    } = useFlowStateRead({pipeline_path, fixedComputationId, initialFilters});

    const permissionResult = useCheckPermissionQuery({
        id: YTApiId.checkPermissions,
        parameters: {path: pipeline_path, user: login, permission: 'write'},
    });
    const writeDenied = isWriteDeniedByPermission(permissionResult);

    React.useEffect(() => {
        setRowSelection({});
    }, [response]);

    const rows = React.useMemo(() => flattenReadStatesResponse(response), [response]);
    const selectedRows = React.useMemo(
        () => selectDeletableRows(rows, rowSelection),
        [rows, rowSelection],
    );

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

    const handleDeleteSelected = () => {
        setDeleteRows(selectedRows);
        setDeleteVisible(true);
    };

    const handleDeleteCommitted = () => {
        setRowSelection({});
        refetch();
    };

    return (
        <React.Fragment>
            <WithStickyToolbar
                hideToolbarShadow
                className={block()}
                toolbar={
                    <FlowStateFilters
                        pipeline_path={pipeline_path}
                        value={filters}
                        onChange={handleFiltersChange}
                        onReset={handleReset}
                        fixedComputationId={fixedComputationId}
                        staticSpec={staticSpec}
                    />
                }
                content={
                    <div className={block('content')}>
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
                    </div>
                }
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
        </React.Fragment>
    );
}

export default FlowStateSection;
