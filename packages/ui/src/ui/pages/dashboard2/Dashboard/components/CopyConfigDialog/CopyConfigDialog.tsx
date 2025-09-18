import React from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';

import format from '../../../../../common/hammer/format';

import {
    getCopyConfigDialogVisibility,
    toggleCopyConfigDialogVisibility,
} from '../../../../../store/reducers/dashboard2/dashboard';
import {copyConfig} from '../../../../../store/actions/dashboard2/dashboard';
import {getCluster} from '../../../../../store/selectors/global';

import {FormApi, YTDFDialog} from '../../../../../components/Dialog';

import {YT} from '../../../../../config/yt-config';

import i18n from './i18n';

interface FormValues {
    cluster: string[];
}

export function CopyConfigDialog() {
    const dispatch = useDispatch();

    const cluster = useSelector(getCluster);
    const copyConfigDialogVisibility = useSelector(getCopyConfigDialogVisibility);

    const onClose = () => dispatch(toggleCopyConfigDialogVisibility());

    const copyConfigOptions = Object.entries(YT.clusters)
        .filter(([configCluster, _]) => configCluster !== cluster)
        .map(([cluster]) => ({value: cluster, content: format.ReadableField(cluster)}));

    return (
        <YTDFDialog<FormValues>
            onAdd={async (form: FormApi<FormValues>) => {
                const {cluster} = form.getState().values;
                await dispatch(copyConfig(cluster[0]));
            }}
            headerProps={{title: i18n('title_copy-config')}}
            visible={copyConfigDialogVisibility}
            fields={[
                {
                    type: 'select',
                    name: 'cluster',
                    caption: i18n('field_cluster'),
                    extras: {
                        options: copyConfigOptions,
                        width: 'max',
                        filterable: true,
                        placeholder: i18n('field_cluster'),
                    },
                },
            ]}
            onClose={onClose}
        />
    );
}
