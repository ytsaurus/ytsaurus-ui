import React, {FC, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getClusterList} from '../../../../store/selectors/slideoutMenu';
import {appendQueryToken} from '../../../../store/actions/settings/settings';
import {getQueryTokens} from '../../../../store/selectors/settings/settings-queries';
import {FormApi, YTDFDialog} from '../../../../components/Dialog';
import {QueryToken} from '../../../../../shared/constants/settings-types';
import {YT} from '../../../../config/yt-config';
import {getClusterProxy} from '../../../../store/selectors/global';
import {ytApiV3} from '../../../../rum/rum-wrap-api';
import i18n from './i18n';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const INITIAL_VALUES = {
    name: '',
    path: '',
    cluster: '',
};

export const AddQueryTokenForm: FC<Props> = ({visible, onClose}) => {
    const dispatch = useDispatch();
    const clusters = useSelector(getClusterList);
    const tokens = useSelector(getQueryTokens);

    const clusterOptions = useMemo(() => {
        return clusters.map(({id, name}) => ({
            value: id,
            content: name,
        }));
    }, [clusters]);

    const handleAdd = async (form: FormApi<QueryToken>) => {
        const {values, errors} = form.getState();

        if (errors && Object.keys(errors).length) {
            return;
        }

        dispatch(
            appendQueryToken({
                name: values.name,
                path: values.path,
                cluster: values.cluster,
            }),
        );

        onClose();
    };

    return (
        <YTDFDialog<QueryToken>
            visible={visible}
            headerProps={{title: i18n('title_add-query-token')}}
            onAdd={handleAdd}
            onClose={onClose}
            initialValues={INITIAL_VALUES}
            fields={[
                {
                    type: 'text' as const,
                    name: 'name',
                    caption: i18n('field_token-name'),
                    required: true,
                    extras: {
                        placeholder: i18n('field_token-name-placeholder'),
                        autoFocus: true,
                    },
                    validator: (value: string) => {
                        if (!value?.trim()) {
                            return i18n('alert_name-required');
                        }
                        if (tokens.some((token) => token.name === value)) {
                            return i18n('alert_name-exists');
                        }
                        return undefined;
                    },
                },
                {
                    type: 'select' as const,
                    name: 'cluster',
                    caption: i18n('field_cluster'),
                    required: true,
                    extras: {
                        placeholder: i18n('field_cluster-placeholder'),
                        options: clusterOptions,
                        filterable: true,
                        width: 'max',
                    },
                    validator: (value: string[] | undefined) => {
                        if (!value?.[0]?.trim()) {
                            return i18n('alert_cluster-required');
                        }
                        return undefined;
                    },
                },
                {
                    type: 'path' as const,
                    name: 'path',
                    caption: i18n('field_token-path'),
                    required: true,
                    extras: (formValues?: QueryToken) => ({
                        disabled: !formValues?.cluster?.[0],
                        placeholder: i18n('field_token-path-placeholder'),
                        cluster: formValues?.cluster?.[0],
                    }),
                    validator: async (value: string, formValues?: QueryToken) => {
                        const trimmedPath = value.trim();
                        if (!trimmedPath) {
                            return i18n('alert_path-required');
                        }

                        const cluster = formValues!.cluster[0];
                        const clusterConfig = YT.clusters[cluster];

                        if (!clusterConfig) {
                            return i18n('alert_cluster-config-error');
                        }

                        try {
                            const exists = await ytApiV3.exists({
                                setup: {proxy: getClusterProxy(clusterConfig)},
                                parameters: {path: value},
                            });
                            if (!exists) {
                                return i18n('alert_path-not-exist');
                            }
                        } catch (error) {
                            return (error as Error).message;
                        }

                        return undefined;
                    },
                },
            ]}
        />
    );
};
