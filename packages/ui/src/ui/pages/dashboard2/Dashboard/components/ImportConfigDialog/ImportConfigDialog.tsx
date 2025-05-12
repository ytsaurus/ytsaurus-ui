import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import map_ from 'lodash/map';

import hammer from '../../../../../common/hammer';

import {
    getImportDialogVisibility,
    toggleImportDialogVisibility,
} from '../../../../../store/reducers/dashboard2/dashboard';
import {importConfig} from '../../../../../store/actions/dashboard2/dashboard';
import {getClusterList} from '../../../../../store/selectors/slideoutMenu';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

interface FormValues {
    cluster: string[];
}

export function ImportConfigDialog() {
    const dispatch = useDispatch();

    const clusterList = useSelector(getClusterList);
    const importDialogVisibility = useSelector(getImportDialogVisibility);

    const onClose = () => dispatch(toggleImportDialogVisibility());

    const importOptions = map_(clusterList, (cluster) => ({
        value: cluster.name.toLowerCase(),
        content: hammer.format['ReadableField'](cluster.name),
    }));

    return (
        <YTDFDialog<FormValues>
            onAdd={async (form: FormApi<FormValues>) => {
                const {cluster} = form.getState().values;
                await dispatch(importConfig(cluster[0]));
            }}
            headerProps={{title: 'Import config'}}
            visible={importDialogVisibility}
            fields={[
                {
                    type: 'select',
                    name: 'cluster',
                    caption: 'Cluser',
                    extras: {
                        options: importOptions,
                        width: 'max',
                        placeholder: 'Cluster',
                    },
                },
            ]}
            onClose={onClose}
        />
    );
}
