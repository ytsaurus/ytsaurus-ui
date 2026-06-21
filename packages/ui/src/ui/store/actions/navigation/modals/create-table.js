import React from 'react';
import axios from 'axios';

import uniq_ from 'lodash/uniq';

import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import {updateView} from '../../../../store/actions/navigation';

import {CREATE_TABLE_MODAL_DATA_FIELDS} from '../../../../constants/navigation/modals/create-table';
import {initialState} from '../../../../store/reducers/navigation/modals/create-table';
import {showErrorPopup} from '../../../../utils/utils';
import Link from '../../../../containers/Link/Link';
import {genNavigationUrl} from '../../../../utils/navigation/navigation';
import {selectCluster} from '../../../selectors/global';
import {toaster} from '../../../../utils/toaster';
import i18n from './i18n';

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

export function createTable(path, attributes) {
    return (dispatch, getState) => {
        const params = {
            path,
            type: 'table',
            attributes,
        };

        const what = attributes.dynamic ? i18n('value_dynamic-table') : i18n('value_static-table');
        const cluster = selectCluster(getState());

        return yt.v3
            .create(params)
            .then(() => {
                dispatch(updateView());
                toaster.add({
                    name: path,
                    timeout: 10000,
                    theme: 'success',
                    title: i18n('title_table-created'),
                    content: (
                        <React.Fragment>
                            {what} <Link url={genNavigationUrl({cluster, path})}>{path}</Link>{' '}
                            {i18n('alert_table-created')}
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
                        theme: 'danger',
                        content: `[code ${code}] ${message}`,
                        title: i18n('title_table-creation-failure'),
                        actions: [
                            {
                                label: i18n('action_view'),
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
        data: {columnLockSuggestions: uniq_(allColumnLockValues.sort())},
    };
}

export function setCreateTableGroupSuggestions(allColumnGroups = []) {
    return {
        type: CREATE_TABLE_MODAL_DATA_FIELDS,
        data: {columnGroupSuggestions: uniq_(allColumnGroups.sort())},
    };
}
