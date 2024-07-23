import forEach_ from 'lodash/forEach';
import keys_ from 'lodash/keys';
import map_ from 'lodash/map';

import ypath from '../../../common/thor/ypath';
import hammer from '../../../common/hammer';
import {Toaster} from '@gravity-ui/uikit';

import createActionTypes from '../../../constants/utils';
import {isRetryFutile} from '../../../utils/index';
import {showErrorPopup} from '../../../utils/utils';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {USE_SUPRESS_SYNC} from '../../../../shared/constants';

export const FETCH_CHUNKS = createActionTypes('CHUNKS');

const toaster = new Toaster();

const chunkTypes = [
    {name: 'chunks'},
    {name: 'foreign_chunks'},
    {name: 'overreplicated_chunks'},
    {name: 'underreplicated_chunks'},
    {
        name: 'quorum_missing_chunks',
        label: function (count) {
            return count > 0 && 'danger';
        },
    },
    {
        name: 'data_missing_chunks',
        label: function (count) {
            return count > 0 && 'warning';
        },
    },
    {
        name: 'parity_missing_chunks',
        label: function (count) {
            return count > 0 && 'warning';
        },
    },
    {name: 'lost_chunks'},
    {
        name: 'lost_vital_chunks',
        label: function (count) {
            return count > 0 && 'danger';
        },
    },
    {
        name: 'unsafely_placed_chunks',
        label: function (count) {
            return count > 0 && 'warning';
        },
    },
];

function prepareChunkCells(chunks) {
    const cells = {
        total: {
            chunks: chunks.chunks.count,
        },
    };

    forEach_(chunks.chunks.multicell_count, (count, cellTag) => {
        cells[cellTag] = {
            total: count,
        };
    });

    forEach_(chunkTypes, (type) => {
        type = type.name;

        if (chunks[type]) {
            // Some chunks types may not exist on cluster, e.g. foreign chunks
            cells['total'][type] = chunks[type].count;

            forEach_(chunks[type].multicell_count, (count, cellTag) => {
                cells[cellTag][type] = count;
            });
        }
    });

    return hammer.utils.objectToArray(cells, 'cell_tag');
}

export function loadChunks() {
    return (dispatch) => {
        const requests = [];

        let requestCounter = 0;
        const totalRequestCounter = keys_(chunkTypes).length;
        const chunks = {};

        function applyChangesWhenReady() {
            requestCounter++;
            if (totalRequestCounter === requestCounter) {
                dispatch({
                    type: FETCH_CHUNKS.SUCCESS,
                    data: {
                        cells: prepareChunkCells(chunks),
                        types: chunkTypes,
                    },
                });
            }
        }

        function prepareChunks(type, attributes) {
            chunks[type] = attributes;

            applyChangesWhenReady();
        }

        map_(chunkTypes, (chunk) => {
            requests.push({
                command: 'get',
                parameters: {
                    path: '//sys/' + chunk.name + '/@',
                    attributes: ['count', 'multicell_count'],
                    ...USE_SUPRESS_SYNC,
                },
            });
        });

        requests.push({
            command: 'get',
            parameters: {
                path: '//sys/@',
                attributes: [
                    'chunk_replicator_enabled',
                    'chunk_sealer_enabled',
                    'chunk_refresh_enabled',
                    'chunk_requisition_update_enabled',
                ],
                ...USE_SUPRESS_SYNC,
            },
        });

        return ytApiV3Id.executeBatch(YTApiId.systemChunks, {requests}).then((data) => {
            const chunksData = data.slice(0, data.length - 1);
            forEach_(chunksData, ({error, output}, index) => {
                if (error) {
                    Promise.reject(error).catch(applyChangesWhenReady);
                } else {
                    prepareChunks(chunkTypes[index].name, output);
                }
            });

            const last = data[data.length - 1];
            return handleLastPromise(
                last.error ? Promise.reject(last.error) : Promise.resolve(last.output),
            );
        });

        function handleLastPromise(promise) {
            return promise
                .then((res) => {
                    const replication = ypath.getValue(res, '/chunk_replicator_enabled');
                    const sealer = ypath.getValue(res, '/chunk_sealer_enabled');
                    const refresh = ypath.getValue(res, '/chunk_refresh_enabled');
                    const requisitionUpdate = ypath.getValue(
                        res,
                        '/chunk_requisition_update_enabled',
                    );

                    dispatch({
                        type: FETCH_CHUNKS.SUCCESS,
                        data: {replication, sealer, refresh, requisitionUpdate},
                    });
                })
                .catch((error) => {
                    dispatch({
                        type: FETCH_CHUNKS.FAILURE,
                        data: error,
                    });

                    const data = error?.response?.data || error;
                    const {code, message} = data;

                    toaster.add({
                        name: 'load/system/chunks',
                        autoHiding: false,
                        theme: 'danger',
                        content: `[code ${code}] ${message}`,
                        title: 'Could not load Chunks',
                        actions: [
                            {
                                label: ' view',
                                onClick: () => showErrorPopup(error),
                            },
                        ],
                    });
                    if (isRetryFutile(error.code)) {
                        return {isRetryFutile: true};
                    }
                });
        }
    };
}
