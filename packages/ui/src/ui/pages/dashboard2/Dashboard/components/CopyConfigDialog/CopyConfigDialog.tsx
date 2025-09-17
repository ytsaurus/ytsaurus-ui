import React from 'react';
import {useDispatch, useSelector} from 'react-redux';

import map_ from 'lodash/map';

import format from '../../../../../common/hammer/format';

import {
    getCopyConfigDialogVisibility,
    toggleCopyConfigDialogVisibility,
} from '../../../../../store/reducers/dashboard2/dashboard';
import {copyConfig} from '../../../../../store/actions/dashboard2/dashboard';
import {getClusterList} from '../../../../../store/selectors/slideoutMenu';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

interface FormValues {
    cluster: string[];
}

export function CopyConfigDialog() {
    const dispatch = useDispatch();

    const clusterList = useSelector(getClusterList);
    const copyConfigDialogVisibility = useSelector(getCopyConfigDialogVisibility);

    const onClose = () => dispatch(toggleCopyConfigDialogVisibility());

    const copyConfigOptions = map_(clusterList, (cluster) => ({
        value: cluster.name.toLowerCase(),
        content: format.ReadableField(cluster.name),
    }));

    return (
        <YTDFDialog<FormValues>
            onAdd={async (form: FormApi<FormValues>) => {
                const {cluster} = form.getState().values;
                await dispatch(copyConfig(cluster[0]));
            }}
            headerProps={{title: 'Copy config'}}
            visible={copyConfigDialogVisibility}
            fields={[
                {
                    type: 'select',
                    name: 'cluster',
                    caption: 'Cluser',
                    extras: {
                        options: copyConfigOptions,
                        width: 'max',
                        filterable: true,
                        placeholder: 'Cluster',
                    },
                },
            ]}
            onClose={onClose}
        />
    );
}
