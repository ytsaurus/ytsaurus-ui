import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import find_ from 'lodash/find';

import ypath from '@ytsaurus/interface-helpers/lib/ypath';
import CancelHelper from '../../../utils/cancel-helper';
import {GENERIC_ERROR_MESSAGE, TYPED_OUTPUT_FORMAT} from '../../../constants/index';
import {preparePartitions} from '../../../utils/tablet/tablet';
import {
    CHANGE_ACTIVE_HISTOGRAM,
    CHANGE_CONTENT_MODE,
    LOAD_TABLET_DATA,
} from '../../../constants/tablet';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';

const requests = new CancelHelper();

function loadPartitions({cellLeadingPeer, tabletPath, unorderedDynamicTable, ...rest}) {
    if (cellLeadingPeer) {
        return ytApiV3Id
            .get(YTApiId.tabletPartitions, {
                path: tabletPath,
                output_format: TYPED_OUTPUT_FORMAT,
            })
            .then((data) => {
                const contents = ypath.getValue(data, '');
                const tabletErrors = ypath.getValue(data, '/errors') || [];
                const replicationErrors = ypath.getValue(data, '/replication_errors') || {};

                const pivotKey = contents.pivot_key;
                const nextPivotKey = contents.next_pivot_key;
                const partitions = unorderedDynamicTable ? [] : preparePartitions(contents);

                const res = {
                    pivotKey,
                    nextPivotKey,
                    partitions,
                    tabletErrors,
                    replicationErrors,
                    tabletPath,
                    cellLeadingPeer,
                    unorderedDynamicTable,
                    ...rest,
                };
                if (!unorderedDynamicTable) {
                    return res;
                }

                const storesPath = `${tabletPath}/stores`;
                return ytApiV3Id
                    .get(YTApiId.tabletStores, {
                        path: storesPath,
                        output_format: TYPED_OUTPUT_FORMAT,
                    })
                    .then((stores) => {
                        return {...res, stores};
                    });
            })
            .catch((error) => {
                return Promise.reject({
                    message:
                        'Could not load tablet partitions information. ' + GENERIC_ERROR_MESSAGE,
                    details: error,
                });
            });
    } else {
        return Promise.reject({
            message: 'Tablet cell has no leading peer. No information to show.',
            details: {},
        });
    }
}

function loadCellAttributes({id, attributes, tablePath, unorderedDynamicTable}) {
    if (attributes.cell_id) {
        return ytApiV3Id
            .get(YTApiId.tabletCellAttributes, {
                path: '//sys/tablet_cells/' + attributes.cell_id + '/@',
            })
            .then((tabletCellAttributes) => {
                const cellLeadingPeer = find_(
                    tabletCellAttributes.peers,
                    (peer) => peer.state === 'leading',
                );
                let tabletPath;

                if (id && cellLeadingPeer) {
                    tabletPath = `//sys/cluster_nodes/${cellLeadingPeer.address}/orchid/tablet_cells/${attributes.cell_id}/tablets/${id}`;
                }

                return {
                    id,
                    attributes,
                    tablePath,
                    tabletCellAttributes,
                    cellLeadingPeer,
                    tabletPath,
                    unorderedDynamicTable,
                };
            })
            .catch((error) => {
                return Promise.reject({
                    message:
                        "Could not load tablet's tablet cell attributes." + GENERIC_ERROR_MESSAGE,
                    details: error,
                });
            });
    } else {
        return Promise.reject({
            message: 'Tablet is not mounted. No information to show.',
            details: {},
        });
    }
}

function loadTableAttributes({id, attributes}) {
    return ytApiV3Id
        .get(YTApiId.tabletTableAttributes, {
            path: '#' + attributes.table_id + '/@',
            attributes: ['path', 'sorted', 'type', 'dynamic'],
        })
        .catch((error) => {
            return Promise.reject({
                message: "Could not load tablet's table attributes. " + GENERIC_ERROR_MESSAGE,
                details: error,
            });
        })
        .then((tableAttributes) => {
            const tablePath = ypath.getValue(tableAttributes, '/path');

            return {
                id,
                attributes,
                tablePath,
                unorderedDynamicTable: isUnorderedDynamicTable(tableAttributes),
            };
        });
}

function loadAttributes(id) {
    return ytApiV3Id
        .get(YTApiId.tabletAttribute, {path: '//sys/tablets/' + id + '/@'})
        .then((attributes) => {
            return {id, attributes};
        })
        .catch((error) => {
            return Promise.reject({
                message: 'Could not load tablet attributes. ' + GENERIC_ERROR_MESSAGE,
                details: error,
            });
        });
}

export function loadTabletData(id) {
    return (dispatch) => {
        dispatch({type: LOAD_TABLET_DATA.REQUEST});

        return loadAttributes(id)
            .then(loadTableAttributes)
            .then(loadCellAttributes)
            .then(loadPartitions)
            .then((data) => {
                dispatch({
                    type: LOAD_TABLET_DATA.SUCCESS,
                    data,
                });
            })
            .catch((error) => {
                if (error.code !== yt.codes.CANCELLED) {
                    dispatch({
                        type: LOAD_TABLET_DATA.FAILURE,
                        data: {error},
                    });
                }
            });
    };
}

export function changeContentMode(contentMode) {
    return {
        type: CHANGE_CONTENT_MODE,
        data: {contentMode},
    };
}

export function changeActiveHistogram(activeHistogram) {
    return {
        type: CHANGE_ACTIVE_HISTOGRAM,
        data: {activeHistogram},
    };
}

export function abortAndReset() {
    return (dispatch) => {
        requests.removeAllRequests();
        dispatch({type: LOAD_TABLET_DATA.CANCELLED});
    };
}

function isUnorderedDynamicTable(attributes) {
    const type = ypath.getValue(attributes, '/type');
    const dynamic = type === 'table' && ypath.getValue(attributes, '/dynamic');
    return dynamic && !ypath.getValue(attributes, '/sorted');
}
