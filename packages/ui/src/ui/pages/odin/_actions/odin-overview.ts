import {ThunkAction} from 'redux-thunk';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';

import Utils from '../odin-utils';
import {RootState} from '../../../store/reducers';
import {OdinOverviewAction, OdinOverviewState} from '../_reducers/odin-overview';
import {
    ODIN_OVERVIEW_CANCELLED,
    ODIN_OVERVIEW_FAILED,
    ODIN_OVERVIEW_HIDDEN_METRICS,
    ODIN_OVERVIEW_PARTIAL,
    ODIN_OVERVIEW_REQUEST,
    ODIN_OVERVIEW_SUCCESS,
} from '../odin-constants';
import {
    getOdinLastVisitedTab,
    getOdinOverviewClusterMetrics,
    getOdinOverviewData,
    getOdinOverviewDataCluster,
    getOdinOverviewHiddenMetrics,
    getOdinOverviewTimeFrom,
    getOdinOverviewTimeFromFilter,
    getOdinOverviewTimeTo,
    getOdinOverviewVisiblePresets,
} from '../_selectors/odin-overview';
import {reloadSetting, setSetting} from '../../../store/actions/settings';
import {showErrorPopup} from '../../../utils/utils';
import {NAMESPACES} from '../../../../shared/constants/settings';
import {ODIN_LAST_VISITED_TAB, ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES} from '../odin-settings';
import {toaster} from '../../../utils/toaster';

type OdinOverviewThunkAction = ThunkAction<any, RootState, any, OdinOverviewAction>;

function getClusterHelper(gs: () => RootState) {
    return getOdinOverviewDataCluster(gs());
}

const COUNT_OF_MINUTES = 30;

export const ODIN_OVERVIEW_TIME_RANGE = COUNT_OF_MINUTES * 60 * 1000;

let cancelMetrics: {cancel: () => void} = {cancel: () => {}};

function fetchOdinOverview(cluster: string, time?: number): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        cancelMetrics.cancel();
        const data = getOdinOverviewData(getState());
        forEach_(data, (item) => item.cancel?.());

        const oldCluster = getClusterHelper(getState);

        dispatch({
            type: ODIN_OVERVIEW_REQUEST,
        });

        if (oldCluster !== cluster) {
            dispatch({
                type: ODIN_OVERVIEW_PARTIAL,
                data: {data: {}, clusterMetrics: [], dataCluster: cluster},
            });
        }

        return Utils.listMetrics(cluster, (c) => {
            cancelMetrics = c;
        })
            .then((clusterMetrics) => {
                if (getClusterHelper(getState) !== cluster) {
                    return;
                }

                const timeFrom = time ? time : Date.now() - ODIN_OVERVIEW_TIME_RANGE;
                const timeTo = timeFrom + ODIN_OVERVIEW_TIME_RANGE;

                dispatch({
                    type: ODIN_OVERVIEW_PARTIAL,
                    data: {
                        clusterMetrics,
                        timeFrom,
                        timeTo,
                    },
                });

                const hiddenMetrics = getOdinOverviewHiddenMetrics(getState());
                Promise.all(
                    clusterMetrics.map(({name}) => {
                        if (!hiddenMetrics[name]) {
                            return dispatch(fetchMetricData(cluster, name, timeFrom, timeTo));
                        } else {
                            return Promise.resolve();
                        }
                    }),
                ).then(() => {
                    dispatch({type: ODIN_OVERVIEW_SUCCESS});
                });
            })
            .catch((error) => {
                if (Utils.isRequestCanceled(error)) {
                    dispatch({type: ODIN_OVERVIEW_CANCELLED});
                } else {
                    dispatch({type: ODIN_OVERVIEW_FAILED, data: error});
                }
            });
    };
}

export function odinOverviewSetPreviousTimeRange(): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const timeFromFilter = getOdinOverviewTimeFromFilter(state);
        if (!timeFromFilter) {
            dispatch(setOdinOverviewFromTimeFilter(Date.now() - 2 * ODIN_OVERVIEW_TIME_RANGE));
        } else {
            dispatch(setOdinOverviewFromTimeFilter(timeFromFilter - ODIN_OVERVIEW_TIME_RANGE));
        }
    };
}

export function odinOverviewSetNextTimeRange(): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const timeFromFilter = getOdinOverviewTimeFromFilter(state);
        if (!timeFromFilter) {
            return;
        } else {
            const nextFilter = timeFromFilter + ODIN_OVERVIEW_TIME_RANGE;
            if (Date.now() - nextFilter < ODIN_OVERVIEW_TIME_RANGE) {
                dispatch(setOdinOverviewFromTimeFilter(undefined));
            } else {
                dispatch(setOdinOverviewFromTimeFilter(nextFilter));
            }
        }
    };
}

export function setOdinOverviewFromTimeFilter(time: number | undefined): OdinOverviewAction {
    return {type: ODIN_OVERVIEW_PARTIAL, data: {timeFromFilter: time}};
}

export function reloadOdinOverview(
    cluster: string,
    timeFromFilter: number | undefined,
): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const timeFilter = getOdinOverviewTimeFromFilter(state);
        const timeFrom = getOdinOverviewTimeFrom(state);

        if (!timeFilter || timeFilter !== timeFrom) {
            dispatch(fetchOdinOverview(cluster, timeFromFilter));
        }
    };
}

function fetchMetricData(
    cluster: string,
    name: string,
    from: number,
    to: number,
): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        let {cancel} = getOdinOverviewData(getState())[name] || {};
        if (cancel) {
            cancel();
        }

        return Utils.getMetric(cluster, name, from, to, (c) => {
            cancel = c.cancel;
        })
            .then((d) => {
                if (getClusterHelper(getState) !== cluster) {
                    return;
                }

                const data = {
                    ...getOdinOverviewData(getState()),
                    [name]: {
                        cancel,
                        metricData: Utils.prepareAvailabilityData(d, COUNT_OF_MINUTES),
                    },
                };
                dispatch({type: ODIN_OVERVIEW_PARTIAL, data: {data}});
            })
            .catch((error) => {
                if (!Utils.isRequestCanceled(error)) {
                    const data = {
                        ...getOdinOverviewData(getState()),
                        [name]: {error},
                    };
                    dispatch({type: ODIN_OVERVIEW_PARTIAL, data: {data}});
                }
            });
    };
}

export function reloadOdinOverviewMetricData(metricName: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getOdinOverviewDataCluster(state);
        const from = getOdinOverviewTimeFrom(state);
        const to = getOdinOverviewTimeTo(state);
        if (from && to) {
            dispatch(fetchMetricData(cluster, metricName, from, to));
        }
    };
}

export function toggleOdinOverviewMetricVisibility(metricName: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const hiddenMetrics = {...getOdinOverviewHiddenMetrics(getState())};
        if (hiddenMetrics[metricName]) {
            delete hiddenMetrics[metricName];
        } else {
            hiddenMetrics[metricName] = true;
        }
        dispatch({
            type: ODIN_OVERVIEW_HIDDEN_METRICS,
            data: {hiddenMetrics},
        });
        if (!hiddenMetrics[metricName]) {
            dispatch(reloadOdinOverviewMetricData(metricName));
        }
    };
}

export function odinOverviewSetAllMetricsVisible(value: boolean): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const oldHhiddenMetrics = getOdinOverviewHiddenMetrics(state);
        let toReload: Array<string> = [];
        const hiddenMetrics: typeof oldHhiddenMetrics = {};
        if (!value) {
            const metrics = getOdinOverviewClusterMetrics(state);
            metrics.forEach(({name}) => {
                hiddenMetrics[name] = true;
            });
        } else {
            toReload = map_(oldHhiddenMetrics, (__: boolean, name: string) => name);
        }

        dispatch({
            type: ODIN_OVERVIEW_HIDDEN_METRICS,
            data: {hiddenMetrics},
        });

        toReload.forEach((name) => {
            dispatch(reloadOdinOverviewMetricData(name));
        });
    };
}

export function odinOverviewShowCreatePresetDialog(
    showCreatePresetDialog: boolean,
): OdinOverviewAction {
    return {type: ODIN_OVERVIEW_PARTIAL, data: {showCreatePresetDialog}};
}

export function odinOverviewAddPreset(name: string, isDefault: boolean): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const toHide = getOdinOverviewHiddenMetrics(getState());
        return dispatch(reloadSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN)).then(() => {
            const presets = [...getOdinOverviewVisiblePresets(getState())];
            presets.push({
                name,
                hiddenMetricNames: map_(toHide, (_, name) => name),
            });
            return dispatch(setSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN, presets))
                .then(() => {
                    if (isDefault) {
                        return dispatch(odinOverviewToggleDefaultPreset(name));
                    }
                })
                .catch((error: any) => {
                    const data = error?.response?.data || error;
                    const {message} = data;

                    toaster.add({
                        name: 'add-preset',
                        autoHiding: false,
                        theme: 'danger',
                        content: message,
                        title: 'Failed to crete preset',
                        actions: [
                            {
                                label: ' view',
                                onClick: () => showErrorPopup(data),
                            },
                        ],
                    });
                });
        });
    };
}

export function odinOverviewSetPresetToRemove(
    name: OdinOverviewState['presetToRemove'],
): OdinOverviewThunkAction {
    return (dispatch) => {
        dispatch({
            type: ODIN_OVERVIEW_PARTIAL,
            data: {presetToRemove: name},
        });
    };
}

export function odinOverviewRemovePreset(name: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        return dispatch(reloadSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN))
            .then(() => {
                const oldPresets = getOdinOverviewVisiblePresets(getState());
                const presets = oldPresets.filter((item) => item.name !== name);
                return dispatch(
                    setSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN, presets),
                );
            })
            .catch((error: any) => {
                const data = error?.response?.data || error;
                const {message} = data;

                toaster.add({
                    name: 'delete-preset',
                    autoHiding: false,
                    theme: 'danger',
                    content: message,
                    title: 'Failed to delete the preset',
                    actions: [{label: ' view', onClick: () => showErrorPopup(data)}],
                });
            });
    };
}

export function odinOverviewToggleDefaultPreset(name: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        return dispatch(reloadSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN)).then(() => {
            const presets = [...getOdinOverviewVisiblePresets(getState())];
            for (let i = 0; i < presets.length; ++i) {
                const item = presets[i];
                if (item.name === name) {
                    presets[i] = {...item, isDefault: !item.isDefault};
                } else if (item.isDefault) {
                    presets[i] = {...item};
                    delete presets[i]['isDefault'];
                }
            }
            return dispatch(
                setSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN, presets),
            ).catch((error: any) => {
                const data = error?.response?.data || error;
                const {message} = data;

                toaster.add({
                    name: 'set-deault-preset',
                    autoHiding: false,
                    theme: 'danger',
                    content: message,
                    title: 'Failed to set the preset as default',
                    actions: [{label: ' view', onClick: () => showErrorPopup(data)}],
                });
            });
        });
    };
}

export function odinOverviewSelectPreset(name: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const presets = getOdinOverviewVisiblePresets(state);
        const preset = presets.find((item) => item.name === name);
        if (preset) {
            const {hiddenMetricNames} = preset;
            const hiddenMetrics: OdinOverviewState['hiddenMetrics'] = {};
            hiddenMetricNames.forEach((name) => {
                hiddenMetrics[name] = true;
            });
            dispatch({
                type: ODIN_OVERVIEW_HIDDEN_METRICS,
                data: {hiddenMetrics},
            });

            const oldHiddenMetrics = getOdinOverviewHiddenMetrics(state);
            forEach_(oldHiddenMetrics, (_, name) => {
                if (!hiddenMetrics[name]) {
                    dispatch(reloadOdinOverviewMetricData(name));
                }
            });
        }
    };
}

export function setOdinLastVisitedTab(tab: string): ThunkAction<any, any, RootState, any> {
    return (dispatch, getState) => {
        const current = getOdinLastVisitedTab(getState());
        if (current !== tab) {
            dispatch(setSetting(ODIN_LAST_VISITED_TAB, NAMESPACES.GLOBAL, tab));
        }
    };
}
