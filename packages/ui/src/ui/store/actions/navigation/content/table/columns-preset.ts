import axios from 'axios';
import _ from 'lodash';
import {ThunkAction} from 'redux-thunk';

// @ts-ignore
import unipika from '../../../../../common/thor/unipika';
import {Toaster} from '@gravity-ui/uikit';

import {
    SET_TABLE_COLUMNS_PRESET,
    SET_TABLE_COLUMNS_PRESET_HASH,
} from '../../../../../constants/navigation/content/table';
import {showErrorPopup, wrapApiPromiseByToaster} from '../../../../../utils/utils';
import {getCluster} from '../../../../../store/selectors/global';
import {
    getColumnsPreset,
    getColumnsPresetHash,
    getIsDynamic,
} from '../../../../../store/selectors/navigation/content/table-ts';
import {RootState} from '../../../../../store/reducers';
import {YTApiId} from '../../../../../rum/rum-wrap-api';
import {makeTableRumId} from './table-rum-id';

const getColumnPresetEndpoint = (cluster: string) => `/api/table-column-preset/${cluster}`;

type ColumnPresetThunkAction = ThunkAction<any, RootState, any, any>;

const {utf8} = unipika.utils;

export function loadColumnPresetIfDefined(): ColumnPresetThunkAction {
    return (dispatch, getState) => {
        const state = getState();
        const hashToLoad = getColumnsPresetHash(state);
        if (!hashToLoad) {
            return Promise.resolve();
        }

        const {hash} = getColumnsPreset(state);
        if (hashToLoad === hash) {
            return Promise.resolve();
        }

        const cluster = getCluster(state);
        const isDynamic = getIsDynamic(state);
        const id = makeTableRumId({cluster, isDynamic});

        return id
            .fetch(
                YTApiId.ui_loadColumnPreset,
                axios.request<{columns: Array<string>; hash: string}>({
                    method: 'GET',
                    url: `${getColumnPresetEndpoint(cluster)}/${hashToLoad}`,
                    headers: {'content-type': 'application/json'},
                }),
            )
            .then(({data: {columns, hash}}) => {
                const presetHash = getColumnsPresetHash(getState());
                if (presetHash !== hash) {
                    return;
                }

                dispatch(setTablePreset(columns, hash));
            })
            .catch((error) => {
                dispatch(setTablePresetError(error));

                new Toaster().add({
                    theme: 'danger',
                    name: 'loadColumnPreset',
                    title: 'Failed to get preset of columns',
                    content: error.message,
                    actions: [
                        {
                            label: ' Details',
                            onClick() {
                                showErrorPopup(error?.response?.data || error);
                            },
                        },
                    ],
                });

                return Promise.reject(error);
            });
    };
}

export function saveColumnPreset(columnsEncoded: Array<string>, cluster: string): Promise<string> {
    const columns = _.map(columnsEncoded, utf8.decode);
    return wrapApiPromiseByToaster(
        axios.request<string>({
            method: 'POST',
            url: getColumnPresetEndpoint(cluster),
            headers: {'content-type': 'application/json'},
            data: columns,
        }),
        {
            skipSuccessToast: true,
            toasterName: 'saveColumnPreset',
            errorContent: 'Failed to save preset of columns',
        },
    ).then((res) => {
        const hash = res.data;
        return hash;
    });
}

export function setTablePresetHash(hash?: string) {
    return {
        type: SET_TABLE_COLUMNS_PRESET_HASH,
        data: hash,
    };
}

function setTablePreset(columns: Array<string>, hash: string) {
    const columnsEncoded = _.map(columns, utf8.encode);
    return {
        type: SET_TABLE_COLUMNS_PRESET,
        data: {error: undefined, columns: columnsEncoded, hash},
    };
}

function setTablePresetError(error: unknown) {
    return {
        type: SET_TABLE_COLUMNS_PRESET,
        data: {error, columns: undefined, hash: undefined},
    };
}
