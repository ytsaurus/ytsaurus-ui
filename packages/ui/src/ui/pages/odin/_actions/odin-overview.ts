import {ThunkAction} from 'redux-thunk';
import _forEach from 'lodash/forEach';
import _map from 'lodash/map';

import Utils from '../odin-utils';
import {RootState} from '../../../store/reducers';
import {OdinOverviewAction, OdinOverviewState} from '../_reducers/odin-overview';
import {
    ODIN_OVERVIEW_CANCELLED,
    ODIN_OVERVIEW_FAILED,
    ODIN_OVERVIEW_HIDDEN_METRICS,
    ODIN_OVERVIEW_PARTIAL,
    ODIN_OVERVIEW_SUCCESS,
} from '../odin-constants';
import {
    getOdinLastVisitedTab,
    getOdinOverviewClusterMetrics,
    getOdinOverviewData,
    getOdinOverviewDataCluster,
    getOdinOverviewDateFrom,
    getOdinOverviewDateTo,
    getOdinOverviewHiddenMetrics,
    getOdinOverviewVisiblePresets,
} from '../_selectors/odin-overview';
import {reloadSetting, setSetting} from '../../../store/actions/settings';
import {Toaster} from '@gravity-ui/uikit';
import {showErrorPopup} from '../../../utils/utils';
import {NAMESPACES} from '../../../../shared/constants/settings';
import {ODIN_LAST_VISITED_TAB, ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES} from '../odin-settings';
import {OdinRootState} from '../_reducers';

type OdinOverviewThunkAction = ThunkAction<any, OdinRootState & RootState, any, OdinOverviewAction>;

function getCluterHelper(gs: () => OdinRootState) {
    return getOdinOverviewDataCluster(gs());
}

const COUNT_OF_MINUTES = 30;

export function fetchOdinOverview(cluster: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        if (getCluterHelper(getState) !== cluster) {
            const data = getOdinOverviewData(getState());
            _forEach(data, ({cancel}) => {
                if (cancel) {
                    cancel();
                }
            });
            dispatch({
                type: ODIN_OVERVIEW_PARTIAL,
                data: {data: {}, clusterMetrics: [], dataCluster: cluster},
            });
        }

        return Utils.listMetrics()
            .then((clusterMetrics) => {
                if (getCluterHelper(getState) !== cluster) {
                    return;
                }

                const to = new Date();
                const from = new Date(to.getTime() - COUNT_OF_MINUTES * 60 * 1000);
                dispatch({
                    type: ODIN_OVERVIEW_SUCCESS,
                    data: {clusterMetrics, dateFrom: from, dateTo: to},
                });

                const hiddenMetrics = getOdinOverviewHiddenMetrics(getState());
                clusterMetrics.forEach(({name}) => {
                    if (!hiddenMetrics[name]) {
                        dispatch(fetchMetricData(cluster, name, from, to));
                    }
                });
            })
            .catch((error) => {
                if (Utils.isRequestCanceled(error)) {
                    dispatch({type: ODIN_OVERVIEW_CANCELLED});
                } else {
                    dispatch({type: ODIN_OVERVIEW_FAILED, data: error});
                }
                return Promise.reject(error);
            });
    };
}

export function fetchMetricData(
    cluster: string,
    name: string,
    from: Date,
    to: Date,
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
                if (getCluterHelper(getState) !== cluster) {
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
                return Promise.reject(error);
            });
    };
}

export function reloadOdinOverviewMetricData(metricName: string): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const cluster = getOdinOverviewDataCluster(state);
        const from = getOdinOverviewDateFrom(state);
        const to = getOdinOverviewDateTo(state);
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
            toReload = _map(oldHhiddenMetrics, (__: boolean, name: string) => name);
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

const toaster = new Toaster();

export function odinOverviewAddPreset(name: string, isDefault: boolean): OdinOverviewThunkAction {
    return (dispatch, getState) => {
        const toHide = getOdinOverviewHiddenMetrics(getState());
        return dispatch(reloadSetting(ODIN_VISIBLE_METRIC_PRESETS, YA_NAMESPACES.ODIN)).then(() => {
            const presets = [...getOdinOverviewVisiblePresets(getState())];
            presets.push({
                name,
                hiddenMetricNames: _map(toHide, (_, name) => name),
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

                    toaster.createToast({
                        name: 'add-preset',
                        allowAutoHiding: false,
                        type: 'error',
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

                toaster.createToast({
                    name: 'delete-preset',
                    allowAutoHiding: false,
                    type: 'error',
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

                toaster.createToast({
                    name: 'set-deault-preset',
                    allowAutoHiding: false,
                    type: 'error',
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
            _forEach(oldHiddenMetrics, (_, name) => {
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
