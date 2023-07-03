import _ from 'lodash';
import ypath from '../../../common/thor/ypath';
import {Toaster} from '@gravity-ui/uikit';

import Updater from '../../../utils/hammer/updater';
import createActionTypes from '../../../constants/utils';
import {isRetryFutile} from '../../../utils/index';
import {MASTERS_UPDATER_ID} from '../../../constants/system/masters';
import {getBatchError, showErrorPopup} from '../../../utils/utils';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {YTApiId, ytApiV3Id} from '../../../rum/rum-wrap-api';
import {USE_SUPRESS_SYNC} from '../../../../shared/constants';

export const FETCH_MASTER_CONFIG = createActionTypes('MASTER_CONFIG');
export const FETCH_MASTER_DATA = createActionTypes('MASTER_DATA');

const toaster = new Toaster();
const updater = new Updater();

function loadMastersConfig() {
    const requests = [
        {
            command: 'get',
            parameters: {
                path: '//sys/primary_masters',
                attributes: ['annotations', 'maintenance', 'maintenance_message'],
                ...USE_SUPRESS_SYNC,
            },
        },
        {
            command: 'get',
            parameters: {
                path: '//sys/@cell_tag',
                ...USE_SUPRESS_SYNC,
            },
        },
        {
            command: 'get',
            parameters: {
                path: '//sys/secondary_masters',
                attributes: ['annotations', 'maintenance', 'maintenance_message'],
                ...USE_SUPRESS_SYNC,
            },
        },
        {
            command: 'get',
            parameters: {
                path: '//sys/timestamp_providers',
                attributes: [
                    'annotations',
                    'native_cell_tag',
                    'maintenance',
                    'maintenance_message',
                ],
                ...USE_SUPRESS_SYNC,
            },
        },
        {
            command: 'get',
            parameters: {
                path: '//sys/discovery_servers',
                attributes: ['annotations', 'native_cell_tag'],
                ...USE_SUPRESS_SYNC,
            },
        },
        {
            command: 'get',
            parameters: {
                path: '//sys/queue_agents/instances',
                attributes: ['annotations', 'maintenance', 'maintenance_message'],
                ...USE_SUPRESS_SYNC,
            },
        },
    ];

    return ytApiV3Id
        .executeBatch(YTApiId.systemMastersConfig, {requests})
        .then(
            ([
                primaryMasterResult,
                primaryCellTagResult,
                secondaryMastersResult,
                timestampProvidersResult,
                discoveryServersResult,
                queueAgentsResult,
            ]) => {
                const batchError = getBatchError(
                    [primaryMasterResult, primaryCellTagResult, secondaryMastersResult],
                    "Masters' details cannot be loaded",
                );
                if (batchError) {
                    throw batchError;
                }
                const error = getBatchError(
                    [timestampProvidersResult],
                    'Timestamp providers cannot be loaded',
                );
                if (
                    error &&
                    timestampProvidersResult.error?.code !== yt.codes.NODE_DOES_NOT_EXIST
                ) {
                    throw error;
                }
                const queueAgentsError = getBatchError(
                    [queueAgentsResult],
                    'Queue agents cannot be loaded',
                );
                if (
                    queueAgentsError &&
                    queueAgentsResult.error?.code !== yt.codes.NODE_DOES_NOT_EXIST
                ) {
                    throw queueAgentsError;
                }

                const primaryMaster = primaryMasterResult.output;
                const secondaryMasters = secondaryMastersResult.output;
                const primaryCellTag = primaryCellTagResult.output;

                const timestampProviders = !timestampProvidersResult.output
                    ? {}
                    : {
                          addresses: _.map(
                              ypath.getValue(timestampProvidersResult.output),
                              (value, address) => {
                                  return {
                                      host: address,
                                      physicalHost: ypath.getValue(
                                          value,
                                          '/@annotations/physical_host',
                                      ),
                                      attributes: ypath.getValue(value, '/@'),
                                  };
                              },
                          ),
                          cellTag: ypath.getValue(
                              timestampProvidersResult.output,
                              '/@native_cell_tag',
                          ),
                      };

                return [
                    {
                        primaryMaster: {
                            addresses: _.map(_.keys(primaryMaster), (address) => {
                                const value = primaryMaster[address];
                                return {
                                    host: address,
                                    physicalHost: ypath.getValue(
                                        value,
                                        '/@annotations/physical_host',
                                    ),
                                    attributes: ypath.getValue(value, '/@'),
                                };
                            }),
                            cellTag: primaryCellTag,
                        },
                        secondaryMasters: _.map(secondaryMasters, (addresses, cellTag) => {
                            return {
                                addresses: _.map(_.keys(addresses), (address) => {
                                    const value = secondaryMasters[cellTag][address];
                                    return {
                                        host: address,
                                        physicalHost: ypath.getValue(
                                            value,
                                            '/@annotations/physical_host',
                                        ),
                                        attributes: ypath.getValue(value, '/@'),
                                    };
                                }),
                                cellTag: Number(cellTag),
                            };
                        }),
                        timestampProviders,
                    },
                    discoveryServersResult,
                    queueAgentsResult,
                ];
            },
        )
        .then(([mainResult, discoveryServersResult, queueAgentsResult]) => {
            const discoveryRequests = _.map(
                ypath.getValue(discoveryServersResult.output),
                (value, address) => ({
                    command: 'get',
                    parameters: {
                        path: `//sys/discovery_servers/${address}/orchid/discovery_server`,
                        ...USE_SUPRESS_SYNC,
                    },
                    address,
                }),
            );

            const queueAgentsStateRequests = _.map(
                ypath.getValue(queueAgentsResult.output),
                (value, address) => ({
                    command: 'get',
                    parameters: {
                        path: `//sys/queue_agents/instances/${address}/orchid/cypress_synchronizer/active`,
                        ...USE_SUPRESS_SYNC,
                    },
                    address,
                }),
            );

            return ytApiV3Id
                .executeBatch(YTApiId.systemMastersConfigDiscoveryServer, {
                    requests: [...discoveryRequests, ...queueAgentsStateRequests],
                })
                .then((results) => {
                    const discoveryResults = results.slice(0, discoveryRequests.length);
                    const queueAgentsStateResults = results.slice(
                        discoveryRequests.length,
                        queueAgentsStateRequests.length,
                    );

                    const discoveryServersStatuses = _.reduce(
                        discoveryResults,
                        (acc, item, key) => {
                            acc[discoveryRequests[key].address] = item?.error
                                ? 'offline'
                                : 'online';
                            return acc;
                        },
                        {},
                    );
                    const queueAgentsStatuses = _.reduce(
                        queueAgentsStateResults,
                        (acc, item, key) => {
                            acc[queueAgentsStateRequests[key].address] =
                                typeof item.output !== 'undefined'
                                    ? item.output
                                        ? 'active'
                                        : 'standby'
                                    : 'offline';
                            return acc;
                        },
                        {},
                    );

                    return [
                        mainResult,
                        discoveryServersResult,
                        queueAgentsResult,
                        discoveryServersStatuses,
                        queueAgentsStatuses,
                    ];
                })
                .catch(() => [mainResult, discoveryServersResult, queueAgentsResult]);
        })
        .then(
            ([
                mainResult,
                discoveryServersResult,
                queueAgentsResult,
                discoveryServersStatuses,
                queueAgentsStatuses,
            ]) => {
                mainResult.discoveryServers = discoveryServersResult.output
                    ? {
                          addresses: _.map(
                              ypath.getValue(discoveryServersResult.output),
                              (value, address) => {
                                  return {
                                      host: address,
                                      physicalHost: ypath.getValue(
                                          value,
                                          '/@annotations/physical_host',
                                      ),
                                      attributes: ypath.getValue(value, '/@'),
                                      state: discoveryServersStatuses[address],
                                  };
                              },
                          ),
                          cellTag: ypath.getValue(
                              discoveryServersResult.output,
                              '/@native_cell_tag',
                          ),
                      }
                    : {};

                mainResult.queueAgents = queueAgentsResult.output
                    ? {
                          addresses: _.map(
                              ypath.getValue(queueAgentsResult.output),
                              (value, address) => {
                                  return {
                                      host: address,
                                      physicalHost: ypath.getValue(
                                          value,
                                          '/@annotations/physical_host',
                                      ),
                                      attributes: ypath.getValue(value, '/@'),
                                      state: queueAgentsStatuses[address],
                                  };
                              },
                          ),
                      }
                    : {};

                return mainResult;
            },
        );
}

function loadHydra(requests, masterInfo, type, masterEntry) {
    const {addresses, cellTag} = masterEntry;
    const hydraPath = '/orchid/monitoring/hydra';
    let cypressPath;

    if (type === 'primary') {
        cypressPath = '//sys/primary_masters';
    } else if (type === 'providers') {
        cypressPath = '//sys/timestamp_providers';
    } else if (type === 'discovery') {
        cypressPath = '//sys/discovery_servers';
    } else if (type === 'secondary') {
        cypressPath = '//sys/secondary_masters/' + cellTag;
    } else {
        cypressPath = '//sys/masters';
    }

    _.each(
        _.sortBy(addresses, (address) => address.host),
        ({host}) => {
            masterInfo.push({host, type, cellTag});
            requests.push({
                command: 'get',
                parameters: {
                    path: cypressPath + '/' + host + hydraPath,
                    timeout: 5000,
                    ...USE_SUPRESS_SYNC,
                },
            });
        },
    );
}

export function loadMasters() {
    return (dispatch) => {
        updater.add(MASTERS_UPDATER_ID, () => dispatch(loadMastersImpl()), 30 * 1000);
    };
}

export function cancelLoadMasters() {
    return () => {
        updater.remove(MASTERS_UPDATER_ID);
    };
}

function loadMastersImpl() {
    return (dispatch) => {
        dispatch({
            type: FETCH_MASTER_CONFIG.REQUEST,
        });
        return loadMastersConfig()
            .then((config) => {
                dispatch({
                    type: FETCH_MASTER_CONFIG.SUCCESS,
                    data: config,
                });
                dispatch({type: FETCH_MASTER_DATA.REQUEST});

                const masterDataRequests = [];
                const masterInfo = [];

                loadHydra(masterDataRequests, masterInfo, 'primary', config.primaryMaster);

                _.each(config.secondaryMasters, (currentConfig) => {
                    loadHydra(masterDataRequests, masterInfo, 'secondary', currentConfig);
                });

                loadHydra(masterDataRequests, masterInfo, 'providers', config.timestampProviders);
                loadHydra(masterDataRequests, masterInfo, 'discovery', config.discoveryServers);

                return ytApiV3Id
                    .executeBatch(YTApiId.systemMasters, {requests: masterDataRequests})
                    .then((data) => {
                        dispatch({
                            type: FETCH_MASTER_DATA.SUCCESS,
                            data: {masterInfo, data},
                        });
                    });
            })
            .catch((error) => {
                dispatch({type: FETCH_MASTER_DATA.FAILURE, data: error});

                const data = error?.response?.data || error;
                const {code, message} = data;

                toaster.createToast({
                    name: 'load/system/masters',
                    allowAutoHiding: false,
                    type: 'error',
                    content: `[code ${code}] ${message}`,
                    title: 'Could not load Masters',
                    actions: [
                        {
                            label: ' view',
                            onClick: () => showErrorPopup(error),
                        },
                    ],
                });

                if (isRetryFutile(error.code)) {
                    dispatch(cancelLoadMasters());
                }

                return Promise.reject(error);
            });
    };
}
