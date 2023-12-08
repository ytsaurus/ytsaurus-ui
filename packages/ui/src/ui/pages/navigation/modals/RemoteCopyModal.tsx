import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';

import {DialogError, FormApi, YTDFDialog} from '../../../components/Dialog/Dialog';
import {
    getRemoteCopyModalPaths,
    getRemoteCopyModalVisible,
} from '../../../store/selectors/navigation/modals/remote-copy-modal';
import {
    hideRemoteCopyModal,
    remoteCopy,
} from '../../../store/actions/navigation/modals/remote-copy-modal';
import {getCluster} from '../../../store/selectors/global';
import {makeLink} from '../../../navigation/Navigation/PathEditorModal/CreateTableModal/CreateTableModal';
import {YTError} from '../../../types';
import {RemoteCopyParams} from '../../../../@types/types';
import {AxiosError} from 'axios';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';

type Values = Omit<RemoteCopyParams, 'input_table_paths'> & {
    input_table_paths: Array<{title: string}>;
};

function RemoteCopyModal() {
    const dispatch = useDispatch();
    const visible = useSelector(getRemoteCopyModalVisible);
    const paths = useSelector(getRemoteCopyModalPaths);
    const cluster = useSelector(getCluster);

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
                        input_table_paths: _.map(input_table_paths, 'title'),
                        pool: pool,
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
            _.map(paths, (item) => {
                return {
                    title: item,
                };
            }),
        [paths],
    );

    return !visible ? null : (
        <YTDFDialog<Values>
            visible={true}
            onAdd={handleAdd}
            onClose={handleClose}
            headerProps={{
                title: 'Remote copy',
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
                    caption: 'Source cluster',
                    extras: {
                        disabled: true,
                        width: 'max',
                    },
                },
                {
                    name: 'input_table_paths',
                    type: 'editable-list',
                    caption: paths.length > 1 ? 'Input paths' : 'Input path',
                    extras: {
                        frozen: true,
                    },
                },
                {
                    name: 'dstCluster',
                    type: 'cluster',
                    caption: 'Destination cluster',
                    required: true,
                    extras: {
                        excludeClusters: [cluster],
                        width: 'max',
                    },
                },
                {
                    name: 'output_table_path',
                    type: 'text',
                    caption: 'Output path',
                    required: true,
                },
                {
                    name: 'override',
                    type: 'tumbler',
                    caption: 'Override output',
                },
                {
                    name: 'copy_attributes',
                    type: 'tumbler',
                    caption: 'Copy user attributes',
                },
                {
                    name: 'schema_inference_mode',
                    type: 'yt-select-single',
                    caption: 'Schema inference',
                    extras: {
                        items: [
                            {
                                value: 'auto',
                                text: 'Auto',
                            },
                            {
                                value: 'from_input',
                                text: 'From input',
                            },
                            {
                                value: 'from_output',
                                text: 'From output',
                            },
                        ],
                        width: 'max',
                    },
                },
                {
                    name: 'pool',
                    type: 'pool',
                    caption: 'Pool',
                    warning: (
                        <>
                            pool must have specified{' '}
                            {docsUrl(
                                makeLink(
                                    UIFactory.docsUrls['operations:remote_copy'],
                                    'limits',
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
                            placeholder: `(cluster: ${dstCluster}) pool name`,
                            calculateValueOnPoolsLoaded({loadedPoolNames}) {
                                const transferPool = _.find(
                                    loadedPoolNames,
                                    (name) => name === `transfer_${cluster}`,
                                );
                                return transferPool || '';
                            },
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
