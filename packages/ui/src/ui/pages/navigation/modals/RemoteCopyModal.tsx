import React from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';

import find_ from 'lodash/find';
import map_ from 'lodash/map';

import {DialogError, type FormApi, YTDFDialog} from '../../../containers/Dialog';
import {
    selectRemoteCopyModalPaths,
    selectRemoteCopyModalVisible,
} from '../../../store/selectors/navigation/modals/remote-copy-modal';
import {
    hideRemoteCopyModal,
    remoteCopy,
} from '../../../store/actions/navigation/modals/remote-copy-modal';
import {selectCluster} from '../../../store/selectors/global';
import {makeLink} from './CreateTableModal/CreateTableModal';
import {type YTError} from '../../../types';
import {type RemoteCopyParams} from '../../../../@types/types';
import {type AxiosError} from 'axios';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';
import i18n from './RemoteCopyModal/i18n';

type Values = Omit<RemoteCopyParams, 'input_table_paths'> & {
    input_table_paths: Array<{title: string}>;
};

function RemoteCopyModal() {
    const dispatch = useDispatch();
    const visible = useSelector(selectRemoteCopyModalVisible);
    const paths = useSelector(selectRemoteCopyModalPaths);
    const cluster = useSelector(selectCluster);

    const [error, setError] = React.useState<YTError | unknown>();

    const handleAdd = React.useCallback(
        async (form: FormApi<Values>) => {
            try {
                setError(undefined);
                const {values} = form.getState();
                const {input_table_paths, pool, ...rest} = values;
                await dispatch(
                    remoteCopy({
                        ...rest,
                        input_table_paths: map_(input_table_paths, 'title'),
                        pool,
                    }),
                );
            } catch (e: unknown) {
                setError((e as AxiosError<YTError>)?.response?.data || e);
                throw e;
            }
        },
        [setError],
    );

    const handleClose = React.useCallback(() => {
        dispatch(hideRemoteCopyModal());
    }, []);

    const pathsValues = React.useMemo(
        () =>
            map_(paths, (item) => {
                return {
                    title: item,
                };
            }),
        [paths],
    );

    const calculateValueOnPoolsLoaded = React.useCallback(
        ({loadedPoolNames}: {loadedPoolNames: Array<string>}) => {
            const transferPool = find_(loadedPoolNames, (name) => name === `transfer_${cluster}`);
            return transferPool || '';
        },
        [cluster],
    );

    return !visible ? null : (
        <YTDFDialog<Values>
            visible={true}
            onAdd={handleAdd}
            onClose={handleClose}
            headerProps={{
                title: i18n('title_remote-copy'),
            }}
            initialValues={{
                cluster_name: cluster,
                input_table_paths: pathsValues,
                schema_inference_mode: 'auto',
                output_table_path: pathsValues[0]?.title,
                override: false,
            }}
            fields={[
                {
                    name: 'cluster_name',
                    type: 'cluster',
                    caption: i18n('field_source-cluster'),
                    extras: {
                        disabled: true,
                        width: 'max',
                    },
                },
                {
                    name: 'input_table_paths',
                    type: 'editable-list',
                    caption:
                        paths.length > 1 ? i18n('field_input-paths') : i18n('field_input-path'),
                    extras: {
                        frozen: true,
                    },
                },
                {
                    name: 'dstCluster',
                    type: 'cluster',
                    caption: i18n('field_destination-cluster'),
                    required: true,
                    extras: {
                        excludeClusters: [cluster],
                        width: 'max',
                    },
                },
                {
                    name: 'output_table_path',
                    type: 'text',
                    caption: i18n('field_output-path'),
                    required: true,
                },
                {
                    name: 'override',
                    type: 'tumbler',
                    caption: i18n('field_override-output'),
                },
                {
                    name: 'copy_attributes',
                    type: 'tumbler',
                    caption: i18n('field_copy-user-attributes'),
                },
                {
                    name: 'schema_inference_mode',
                    type: 'yt-select-single',
                    caption: i18n('field_schema-inference'),
                    extras: {
                        items: [
                            {
                                value: 'auto',
                                text: i18n('value_auto'),
                            },
                            {
                                value: 'from_input',
                                text: i18n('value_from-input'),
                            },
                            {
                                value: 'from_output',
                                text: i18n('value_from-output'),
                            },
                        ],
                        width: 'max',
                    },
                },
                {
                    name: 'pool',
                    type: 'pool',
                    caption: i18n('field_pool'),
                    warning: (
                        <>
                            {i18n('context_pool-must-have-limits')}{' '}
                            {docsUrl(
                                makeLink(
                                    UIFactory.docsUrls['operations:remote_copy'],
                                    i18n('action_limits'),
                                    true,
                                ),
                            )}
                        </>
                    ),
                    visibilityCondition: {
                        when: 'dstCluster',
                        isActive: (value) => Boolean(value),
                    },
                    required: true,
                    tooltip: docsUrl(
                        makeLink(
                            UIFactory.docsUrls[
                                'operations:operations_options#obshie-opcii-dlya-vseh-tipov-operacij'
                            ],
                        ),
                    ),
                    extras: ({dstCluster}: Values) => {
                        return {
                            cluster: dstCluster,
                            placeholder: i18n('field_pool-placeholder', {dstCluster}),
                            calculateValueOnPoolsLoaded,
                            allowEphemeral: true,
                        };
                    },
                },
                ...(!error
                    ? []
                    : [
                          {
                              name: 'error',
                              type: 'block' as const,
                              extras: {
                                  children: <DialogError error={error} />,
                              },
                          },
                      ]),
            ]}
        />
    );
}

export default React.memo(RemoteCopyModal);
