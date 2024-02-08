import React from 'react';
import axios from 'axios';
import _ from 'lodash';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {Toaster} from '@gravity-ui/uikit';
import {updateView} from '../../../../store/actions/navigation';

import {CREATE_TABLE_MODAL_DATA_FIELDS} from '../../../../constants/navigation/modals/create-table';
import {initialState} from '../../../../store/reducers/navigation/modals/create-table';
import {showErrorPopup} from '../../../../utils/utils';
import Link from '../../../../components/Link/Link';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {getCluster} from '../../../selectors/global';

export function openCreateTableModal(parentDirectory) {
    return (dispatch) => {
        dispatch({
            type: CREATE_TABLE_MODAL_DATA_FIELDS,
            data: {...initialState, showModal: true, parentDirectory},
        });
    };
}

export function closeCreateTableModal() {
    return (dispatch) => {
        dispatch({
            type: CREATE_TABLE_MODAL_DATA_FIELDS,
            data: {showModal: false},
        });
    };
}

const toaster = new Toaster();

export function createTable(path, attributes) {
    return (dispatch, getState) => {
        const params = {
            path,
            type: 'table',
            attributes,
        };

        const what = attributes.dynamic ? 'Dynamic table' : 'Static table';
        const cluster = getCluster(getState());

        return yt.v3
            .create(params)
            .then(() => {
                dispatch(updateView());
                toaster.add({
                    name: path,
                    timeout: 10000,
                    type: 'success',
                    title: 'Table created',
                    content: (
                        <React.Fragment>
                            {what} <Link url={genNavigationUrl({cluster, path})}>{path}</Link>{' '}
                            successfully created
                        </React.Fragment>
                    ),
                });
            })
            .catch((error) => {
                if (!axios.isCancel(error)) {
                    dispatch({
                        type: CREATE_TABLE_MODAL_DATA_FIELDS,
                        data: {error},
                    });
                    const data = error?.response?.data || error?.response || error;
                    const {code, message} = data;

                    toaster.add({
                        name: path,
                        timeout: 10000,
                        type: 'error',
                        content: `[code ${code}] ${message}`,
                        title: 'Table creation failure',
                        actions: [
                            {
                                label: ' view',
                                onClick: () => showErrorPopup(data),
                            },
                        ],
                    });
                    return Promise.reject(error);
                }
            });
    };
}

export function setCreateTableKeyColumns(keyColumns) {
    return (dispatch) => {
        dispatch({
            type: CREATE_TABLE_MODAL_DATA_FIELDS,
            data: {keyColumns},
        });
    };
}

export function setCreateTableColumnsOrder(columnsOrder) {
    return (dispatch) => {
        dispatch({
            type: CREATE_TABLE_MODAL_DATA_FIELDS,
            data: {columnsOrder},
        });
    };
}

export function setCreateTableLockSuggestions(allColumnLockValues = []) {
    return {
        type: CREATE_TABLE_MODAL_DATA_FIELDS,
        data: {columnLockSuggestions: _.uniq(allColumnLockValues.sort())},
    };
}

export function setCreateTableGroupSuggestions(allColumnGroups = []) {
    return {
        type: CREATE_TABLE_MODAL_DATA_FIELDS,
        data: {columnGroupSuggestions: _.uniq(allColumnGroups.sort())},
    };
}
