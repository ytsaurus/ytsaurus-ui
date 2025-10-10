import React, {FC, useEffect, useState} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {appendQueryToken} from '../../../../store/actions/settings/settings';
import {getQueryTokens} from '../../../../store/selectors/settings/settings-queries';
import {FormApi, YTDFDialog, makeErrorFields} from '../../../../components/Dialog';
import {QueryToken} from '../../../../../shared/constants/settings-types';
import {YT} from '../../../../config/yt-config';
import i18n from './i18n';
import {Alert} from '@gravity-ui/uikit';
import {tokenPathValidator} from './tokenPathValdator';
import {YTError} from '../../../../../@types/types';

interface Props {
    visible: boolean;
    onClose: () => void;
}

const INITIAL_VALUES = {
    name: '',
    path: '',
    cluster: '',
};

const clusterOptions = Object.values(YT.clusters)
    .sort((a, b) => {
        return a.name > b.name ? 1 : -1;
    })
    .map(({id, name}) => ({
        value: id,
        content: name,
    }));

export const AddQueryTokenForm: FC<Props> = ({visible, onClose}) => {
    const dispatch = useDispatch();
    const tokens = useSelector(getQueryTokens);
    const [error, setError] = useState<YTError>();

    useEffect(() => {
        if (visible) {
            setError(undefined);
        }
    }, [visible]);

    const handleAdd = async (form: FormApi<QueryToken>) => {
        const {values, errors} = form.getState();

        if (errors && Object.keys(errors).length) {
            return;
        }

        try {
            await dispatch(
                appendQueryToken({
                    name: values.name,
                    path: values.path,
                    cluster: values.cluster,
                }),
            );
        } catch (e) {
            setError(e as YTError);
            throw e;
        }
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
                    validator: tokenPathValidator,
                },
                {
                    type: 'block' as const,
                    name: 'message',
                    extras: {
                        children: (
                            <Alert theme="warning" message={i18n('alert_token-file-security')} />
                        ),
                    },
                },
                ...makeErrorFields([error]),
            ]}
        />
    );
};
