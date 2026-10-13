import type {FlowKeySchemaResolution, FlowRowKeySchema, FlowStateResultRow} from './types';

import type {FlowKeyColumn, FlowStateTarget, FlowStaticSpec} from '../../../../../shared/yt-types';
import ypath from '../../../../common/thor/ypath';

function extractGroupByColumns(groupBySchema: unknown): Array<FlowKeyColumn> {
    const columns = ypath.getValue(groupBySchema);
    return Array.isArray(columns) ? (columns as Array<FlowKeyColumn>) : [];
}

export function getOwnProperty<T>(
    dictionary: Record<string, T> | undefined,
    name: string | undefined,
): T | undefined {
    if (!dictionary || !name || !Object.prototype.hasOwnProperty.call(dictionary, name)) {
        return undefined;
    }
    return dictionary[name];
}

export function getComputationGroupByColumns(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
): Array<FlowKeyColumn> {
    const computation = getOwnProperty(spec?.computations, computationId);
    return extractGroupByColumns(computation?.group_by_schema);
}

function withoutExpressionColumns(columns: Array<FlowKeyColumn>): Array<FlowKeyColumn> {
    return columns.filter((column) => !column.expression);
}

export function getComputationKeyColumns(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
): Array<FlowKeyColumn> {
    return withoutExpressionColumns(getComputationGroupByColumns(spec, computationId));
}

function getJoinerKeyOverrideColumns(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    stateName: string | undefined,
): Array<FlowKeyColumn> {
    const computation = getOwnProperty(spec?.computations, computationId);
    const joiners = ypath.getValue(computation?.external_state_joiners);
    const joiner = getOwnProperty(joiners, stateName);
    const joinOn = ypath.getValue(joiner)?.join_on;
    return extractGroupByColumns(ypath.getValue(joinOn)?.key_schema_override);
}

function isDeclaredManager(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    stateName: string | undefined,
): boolean {
    const computation = getOwnProperty(spec?.computations, computationId);
    const managers = ypath.getValue(computation?.external_state_managers);
    return getOwnProperty(managers, stateName) !== undefined;
}

export function resolveKeySchema(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    stateName: string | undefined,
    target: FlowStateTarget,
): FlowKeySchemaResolution {
    const reachesJoiners = target === 'all' || target === 'external_key_state';
    const overrideColumns = reachesJoiners
        ? getJoinerKeyOverrideColumns(spec, computationId, stateName)
        : [];
    const overrideActive =
        overrideColumns.length > 0 && !isDeclaredManager(spec, computationId, stateName);
    const allKeyColumns = overrideActive
        ? overrideColumns
        : getComputationGroupByColumns(spec, computationId);
    return {
        keyColumns: withoutExpressionColumns(allKeyColumns),
        allKeyColumns,
        overrideActive,
    };
}

export function resolveRowKeySchema(
    spec: FlowStaticSpec | undefined,
    row: FlowStateResultRow,
): FlowRowKeySchema {
    const overrideColumns =
        row.section === 'joined_external_key_state'
            ? getJoinerKeyOverrideColumns(spec, row.computationId, row.stateName)
            : [];
    if (!overrideColumns.length) {
        const allKeyColumns = getComputationGroupByColumns(spec, row.computationId);
        return {keyColumns: withoutExpressionColumns(allKeyColumns), allKeyColumns};
    }
    if (isDeclaredManager(spec, row.computationId, row.stateName)) {
        return {keyColumns: [], allKeyColumns: []};
    }
    return {
        keyColumns: withoutExpressionColumns(overrideColumns),
        allKeyColumns: overrideColumns,
        keySchemaStateName: row.stateName,
    };
}

export function getComputationStateNames(
    spec: FlowStaticSpec | undefined,
    computationId: string | undefined,
    target: FlowStateTarget,
): Array<string> {
    const computation = getOwnProperty(spec?.computations, computationId);
    if (!computation) {
        return [];
    }
    const managerNames = Object.keys(computation.external_state_managers ?? {});
    if (target === 'external_key_state') {
        return managerNames;
    }
    const joiners = ypath.getValue(computation.external_state_joiners);
    const joinerNames =
        joiners && typeof joiners === 'object' && !Array.isArray(joiners)
            ? Object.keys(joiners)
            : [];
    return [...new Set([...managerNames, ...joinerNames])];
}
