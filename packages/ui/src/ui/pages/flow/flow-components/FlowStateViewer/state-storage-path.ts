import type {FlowStateResultRow, FlowStateStorageLocation} from './types';

import type {FlowStaticSpec} from '../../../../../shared/yt-types';
import ypath from '../../../../common/thor/ypath';
import {getOwnProperty} from './state-schema';

export function resolveStateStoragePath(
    row: FlowStateResultRow,
    pipelinePath: string,
    spec: FlowStaticSpec | undefined,
): FlowStateStorageLocation | undefined {
    if (row.section === 'key_state') {
        return {path: `${pipelinePath}/states`};
    }
    if (row.section === 'partition_state') {
        return {path: `${pipelinePath}/partition_states`};
    }
    if (!row.computationId) {
        return undefined;
    }
    const computation = getOwnProperty(spec?.computations, row.computationId);
    const declarationsNode =
        row.section === 'external_key_state'
            ? getOwnProperty(computation, 'external_state_managers')
            : getOwnProperty(computation, 'external_state_joiners');
    const declarations = ypath.getValue(declarationsNode);
    const declaration = ypath.getValue(getOwnProperty(declarations, row.stateName));
    const parameters = ypath.getValue(getOwnProperty(declaration, 'parameters'));
    const pathNode = getOwnProperty(parameters, 'path');
    const path = ypath.getValue(pathNode);
    if (typeof path !== 'string' || !path.length) {
        return undefined;
    }
    const cluster = getOwnProperty(ypath.getAttributes(pathNode), 'cluster');
    return {path, cluster: typeof cluster === 'string' ? cluster : undefined};
}
