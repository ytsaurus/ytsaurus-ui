import React from 'react';
import cn from 'bem-cn-lite';

import {Alert} from '@gravity-ui/uikit';

import {type tanstack} from '../../../../../components/DataTableGravity';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {checkPermission} from '../../../../../store/api/yt/checkPermissions/endpoint';
import {FlowTab} from '../../../../../store/reducers/flow/filters';
import {selectCluster, selectCurrentUserName} from '../../../../../store/selectors/global';
import {makeFlowLink} from '../../../../../utils/app-url/makeFlowLink';

import {useSelector} from '../../../../../store/redux-hooks';

import {FlowDeleteStatesDialog} from '../FlowDeleteStatesDialog/FlowDeleteStatesDialog';
import {FlowStateFilters} from '../FlowStateFilters/FlowStateFilters';
import {FlowStateResults} from '../FlowStateResults/FlowStateResults';
import {fetchSpec, flowReadStates} from '../flow-state-api';
import {
    AUTO_LOAD_DEBOUNCE_MS,
    INITIAL_READ_STATE,
    buildRowFilterUpdate,
    buildStateReadBody,
    flattenReadStatesResponse,
    flowStateReadReducer,
    getComputationStateNames,
    isWriteDeniedByPermission,
    resolveKeySchema,
    resolveRowKeySchema,
    resolveStateStoragePath,
    seedStateFilters,
    selectDeletableRows,
} from '../helpers';
import i18n from './i18n';
import type {
    FlowStateCellHandlers,
    FlowStateFiltersValue,
    FlowStateResultRow,
    FlowStateRowFilterField,
} from '../types';
import type {FlowStaticSpec} from '../../../../../../shared/yt-types';

import './FlowStateSection.scss';

const block = cn('yt-flow-state-section');

export type FlowStateSectionProps = {
    pipeline_path: string;
    fixedComputationId?: string;
    initialFilters?: Partial<FlowStateFiltersValue>;
};

function useDebouncedValue<T>(value: T, delayMs: number): T {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delayMs);
        return () => window.clearTimeout(timer);
    }, [value, delayMs]);
    return debounced;
}

export function FlowStateSection({
    pipeline_path,
    fixedComputationId,
    initialFilters,
}: FlowStateSectionProps) {
    const [filters, setFilters] = React.useState<FlowStateFiltersValue>(() =>
        seedStateFilters(fixedComputationId, initialFilters),
    );
    const [staticSpec, setStaticSpec] = React.useState<FlowStaticSpec>();
    const [readState, dispatchRead] = React.useReducer(flowStateReadReducer, INITIAL_READ_STATE);
    const [validationError, setValidationError] = React.useState<string>();
    const [rowSelection, setRowSelection] = React.useState<tanstack.RowSelectionState>({});
    const [deleteRows, setDeleteRows] = React.useState<Array<FlowStateResultRow>>();
    const [deleteVisible, setDeleteVisible] = React.useState(false);
    const [writeDenied, setWriteDenied] = React.useState(true);
    const login = useSelector(selectCurrentUserName);
    const cluster = useSelector(selectCluster);

    const loadStaticSpec = React.useCallback(() => {
        let cancelled = false;
        fetchSpec(pipeline_path)
            .then((data) => {
                if (!cancelled) {
                    setStaticSpec(data.spec as FlowStaticSpec);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setStaticSpec(undefined);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [pipeline_path]);

    React.useEffect(() => loadStaticSpec(), [loadStaticSpec]);

    React.useEffect(() => {
        let cancelled = false;
        checkPermission({
            id: YTApiId.checkPermissions,
            parameters: {path: pipeline_path, user: login, permission: 'write'},
        })
            .then((result) => {
                if (!cancelled) {
                    setWriteDenied(isWriteDeniedByPermission(result));
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setWriteDenied(true);
                }
            });
        return () => {
            cancelled = true;
        };
    }, [pipeline_path, login]);

    const hasScope = Boolean(filters.computationId || filters.partitionId);
    const loading = readState.loadingRequestId !== undefined;

    const revisionRef = React.useRef(readState.revision);
    revisionRef.current = readState.revision;
    const nextRequestIdRef = React.useRef(readState.requestId);
    const lastRequestRef = React.useRef<string>();

    const runRead = React.useCallback(
        (current: FlowStateFiltersValue, dedupe: boolean) => {
            const built = buildStateReadBody(
                current,
                resolveKeySchema(
                    staticSpec,
                    current.computationId,
                    current.stateName,
                    current.target,
                ),
            );
            if ('error' in built) {
                setValidationError(i18n(built.error.errorKey, built.error.params));
                return;
            }
            setValidationError(undefined);
            const body = {...built.body, limit: current.limit};
            const revision = revisionRef.current;
            const requestKey = `${revision}:${JSON.stringify(body)}`;
            if (dedupe && lastRequestRef.current === requestKey) {
                return;
            }
            lastRequestRef.current = requestKey;
            const requestId = ++nextRequestIdRef.current;
            dispatchRead({type: 'load-started', requestId});
            flowReadStates(pipeline_path, body)
                .then((response) => dispatchRead({type: 'load-succeeded', requestId, response}))
                .catch((error) => dispatchRead({type: 'load-failed', requestId, error}));
        },
        [staticSpec, pipeline_path],
    );

    const debouncedFilters = useDebouncedValue(filters, AUTO_LOAD_DEBOUNCE_MS);

    React.useEffect(() => {
        if (!debouncedFilters.computationId && !debouncedFilters.partitionId) {
            setValidationError(undefined);
            return;
        }
        runRead(debouncedFilters, true);
    }, [debouncedFilters, runRead]);

    React.useEffect(() => {
        setRowSelection({});
    }, [readState.response]);

    const rows = React.useMemo(
        () => flattenReadStatesResponse(readState.response),
        [readState.response],
    );
    const selectedRows = React.useMemo(
        () => selectDeletableRows(rows, rowSelection),
        [rows, rowSelection],
    );

    const handleFiltersChange = React.useCallback((next: FlowStateFiltersValue) => {
        setFilters(next);
        setRowSelection({});
        dispatchRead({
            type: 'filters-changed',
            hasScope: Boolean(next.computationId || next.partitionId),
            requestId: ++nextRequestIdRef.current,
        });
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
        runRead(filters, false);
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
                response={readState.response}
                loading={loading}
                error={readState.error}
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
