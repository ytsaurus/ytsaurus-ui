import React from 'react';

import {FlowTab} from '../../../../../store/reducers/flow/filters';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectCluster} from '../../../../../store/selectors/global';
import {makeFlowLink} from '../../../../../utils/app-url/makeFlowLink';

import {getComputationStateNames, resolveRowKeySchema} from '../state-filters';
import {buildRowFilterUpdate, resolveStateStoragePath} from '../state-values';
import type {
    FlowStateCellHandlers,
    FlowStateFiltersValue,
    FlowStateResultRow,
    FlowStateRowFilterField,
} from '../types';
import type {FlowStaticSpec} from '../../../../../../shared/yt-types';

export function useFlowStateCellHandlers({
    pipeline_path,
    filters,
    staticSpec,
    fixedComputationId,
    onFiltersChange,
}: {
    pipeline_path: string;
    filters: FlowStateFiltersValue;
    staticSpec: FlowStaticSpec | undefined;
    fixedComputationId?: string;
    onFiltersChange: (next: FlowStateFiltersValue) => void;
}): FlowStateCellHandlers {
    const cluster = useSelector(selectCluster);

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

    return React.useMemo(
        () => ({getRowFilterUpdate, onFiltersChange, resolveStoragePath, resolveComputationLink}),
        [getRowFilterUpdate, onFiltersChange, resolveStoragePath, resolveComputationLink],
    );
}
