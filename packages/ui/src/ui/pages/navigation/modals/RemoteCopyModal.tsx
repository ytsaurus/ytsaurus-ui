import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import _ from 'lodash';

import YTInfraDialog, {DialogError, FormApi} from '../../../components/Dialog/Dialog';
import {
    getRemoteCopyCodecs,
    getRemoteCopyModalPaths,
    getRemoteCopyModalVisible,
} from '../../../store/selectors/navigation/modals/remote-copy-modal';
import {
    hideRemoteCopyModal,
    remoteCopy,
} from '../../../store/actions/navigation/modals/remote-copy-modal';
import {getCluster, getCurrentUserName} from '../../../store/selectors/global';
import {
    getCompressionCodecs,
    getErasureCodecs,
} from '../../../store/selectors/global/supported-features';
import {makeLink} from '../../../navigation/Navigation/PathEditorModal/CreateTableModal/CreateTableModal';
import {YTError} from '../../../types';
import {RemoteCopyParams} from '../../../../@types/types';
import {AxiosError} from 'axios';
import {docsUrl} from '../../../config';
import UIFactory from '../../../UIFactory';

type Values = Omit<RemoteCopyParams, 'input_table_paths' | 'compression_codec'> & {
    input_table_paths: Array<{title: string}>;
    compression_codec: Array<string>;
};

function RemoteCopyModal() {
    const dispatch = useDispatch();
    const visible = useSelector(getRemoteCopyModalVisible);
    const paths = useSelector(getRemoteCopyModalPaths);
    const cluster = useSelector(getCluster);
    const login = useSelector(getCurrentUserName);

    const [error, setError] = React.useState<YTError | undefined>();

    const handleAdd = React.useCallback(
        async (form: FormApi<Values>) => {
            try {
                setError(undefined);
                const {values} = form.getState();
                const {input_table_paths, pool, compression_codec, ...rest} = values;
                await dispatch(
                    remoteCopy({
                        ...rest,
                        input_table_paths: _.map(input_table_paths, 'title'),
                        compression_codec: compression_codec.join(''),
                        pool: pool || login,
                    }),
                );
            } catch (e) {
                setError((e as AxiosError)?.response?.data || e);
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

    const compressionCodecs = useSelector(getCompressionCodecs);
    const erasureCodecs = useSelector(getErasureCodecs);

    const {compression_codec, erasure_codec} = useSelector(getRemoteCopyCodecs);

    return !visible ? null : (
        <YTInfraDialog<Values>
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
                compression_codec,
                erasure_codec,
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
                    name: 'compression_codec',
                    type: 'select-with-subitems' as const,
                    caption: 'Compression',
                    tooltip: docsUrl(
                        makeLink(UIFactory.docsUrls['storage:compression#compression_codecs']),
                    ),
                    extras: compressionCodecs,
                },
                {
                    name: 'erasure_codec',
                    type: 'yt-select-single',
                    caption: 'Erasure codec',
                    tooltip: docsUrl(makeLink(UIFactory.docsUrls['storage:replication#erasure'])),
                    extras: {
                        items: erasureCodecs,
                        hideFilter: true,
                        width: 'max',
                    },
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
                    tooltip: docsUrl(
                        makeLink(
                            UIFactory.docsUrls[
                                'operations:operations_options#obshie-opcii-dlya-vseh-tipov-operacij'
                            ],
                        ),
                    ),
                    extras: ({dstCluster}: Values) => {
                        return {cluster: dstCluster, placeholder: login};
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
