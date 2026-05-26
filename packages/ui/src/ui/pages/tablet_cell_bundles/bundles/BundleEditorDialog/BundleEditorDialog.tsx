import React from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import cn from 'bem-cn-lite';
import isEmpty_ from 'lodash/isEmpty';

import {Info} from '../../../../components/Info/Info';
import {BundleParamsList} from './components/BundleParamsList/BundleParamsList';
import {
    type DialogField,
    type DialogTabField,
    type FormApi,
    YTDFDialog,
    makeFormSubmitError,
} from '../../../../containers/Dialog';
import hammer from '../../../../common/hammer';

import {selectClusterUiConfig} from '../../../../store/selectors/global';
import {selectIsAdmin} from '../../../../store/selectors/global/is-developer';
import {
    hideTabletCellBundleEditor,
    setBundleEditorController,
} from '../../../../store/actions/tablet_cell_bundles/tablet-cell-bundle-editor';
import {
    selectBundleEditorData,
    selectTabletBundlesWriteableByName,
} from '../../../../store/selectors/tablet_cell_bundles';
import {
    type BundleResourceGuarantee,
    type OrchidBundleResource,
} from '../../../../store/reducers/tablet_cell_bundles';
import {selectTabletCellBundleEditorState} from '../../../../store/selectors/tablet_cell_bundles/tablet-cell-bundle-editor';

import {
    bundleEditorDict,
    createConfigurationList,
    createParams,
    getBundleControllerResource,
    getInitialFormValues,
    getResourceData,
    instanceCountValidate,
    prepareSubmitBundle,
    simpleBundleValidate,
} from '../../../../utils/tablet_cell_bundles/bundles/bundle-editor-dialog';
import UIFactory, {isAbcAllowed} from '../../../../UIFactory';
import {makeLink} from '../../../../utils/utils';
import {docsUrl} from '../../../../config';

import './BundleEditorDialog.scss';
import i18n from './i18n';
import {type Pick2} from '../../../../../@types/types';
import {selectIsQueryMemoryLimitSupported} from '../../../../store/selectors/global/supported-features';
import {validateNumber} from '../../../../common/hammer/validate-number';

const block = cn('bundle-editor');

export interface BundleEditorDialogFormValues {
    general: {
        abc?: {slug: string; id?: number};
        changelog_account?: string;
        snapshot_account?: string;
    };
    resources: {
        info?: string; // system
        rpc_proxy_count?: number; // todo
        rpc_proxy_resource_guarantee?: BundleResourceGuarantee;
        tablet_node_count?: number;
        tablet_node_resource_guarantee?: BundleResourceGuarantee;
        tablet_count?: number; // old
        tablet_static_memory?: number; // pld
    };
    memory_limits: {
        memory_reset: boolean; // system
        reserved?: number;
        tablet_static?: number;
        tablet_dynamic?: number;
        compressed_block_cache?: number;
        uncompressed_block_cache?: number;
        versioned_chunk_meta?: number;
        lookup_row_cache?: number;
        key_filter_block_cache?: number;
        query?: number;
    };
    cpu_limits: {
        threadPool_reset?: boolean; //system
        lookup_thread_pool_size?: number;
        query_thread_pool_size?: number;
        write_thread_pool_size?: number;
    };
}

export function BundleEditorDialog() {
    const {
        visibleEditor,
        bundleName,
        bundleData,
        data,
        bundleControllerData: orchidData,
    } = useSelector(selectTabletCellBundleEditorState);

    const clusterUiConfig = useSelector(selectClusterUiConfig);
    const queryMemoryLimitIsSupported = useSelector(selectIsQueryMemoryLimitSupported);

    const {defaultConfig: bundleDefaultConfig} = useSelector(selectBundleEditorData);

    const bundleControllerConfig = bundleData?.bundle_controller_target_config;
    const enableBundleController = bundleData?.enable_bundle_controller || false;

    const {usage: tabletCountUsage} = getResourceData(data, 'tablet_count');
    const {usage: tabletStaticMemoryUsage} = getResourceData(data, 'tablet_static_memory');

    const writeableByName = useSelector(selectTabletBundlesWriteableByName);
    const allowTabletCount = writeableByName.get(bundleName ?? '');
    const allowEdit = useSelector(selectIsAdmin);

    const initialValues: Partial<BundleEditorDialogFormValues> = (() => {
        if (!enableBundleController) {
            return getInitialFormValues(data);
        }
        if (!bundleControllerConfig) {
            return {};
        }
        return getInitialFormValues(data, bundleControllerConfig);
    })();

    const [rpcConfigurations, nodeConfigurations, dcConfigurations] = (() => {
        if (!bundleDefaultConfig) {
            return [[], [], []];
        }
        const {rpc_proxy_sizes, tablet_node_sizes, data_centers} = bundleDefaultConfig;

        return [
            createConfigurationList(rpc_proxy_sizes),
            createConfigurationList(tablet_node_sizes),
            data_centers ? [...Object.values(data_centers)] : [],
        ];
    })();

    const renderGeneralTabs: DialogTabField<DialogField<BundleEditorDialogFormValues>> = {
        name: 'general',
        title: i18n('title_general'),
        type: 'tab-vertical',
        size: 's',
        fields: [
            ...(!isAbcAllowed()
                ? []
                : [
                      {
                          name: 'abc',
                          type: 'abc-control' as const,
                          caption: i18n('field_abc-service'),
                          extras: {
                              placeholder: i18n('field_abc-service_placeholder'),
                              disabled: !allowEdit,
                          },
                      },
                  ]),
            {
                name: 'changelog_account',
                type: 'accounts-suggest-with-loading',
                caption: i18n('field_changelog-account'),
                extras: {
                    allowRootAccount: true,
                    disabled: !allowEdit,
                },
            },
            {
                name: 'snapshot_account',
                type: 'accounts-suggest-with-loading',
                caption: i18n('field_snapshot-account'),
                extras: {
                    allowRootAccount: true,
                    disabled: !allowEdit,
                },
            },
        ],
    };

    const renderResourceTab: DialogTabField<DialogField<BundleEditorDialogFormValues>> = {
        name: 'resources',
        title: i18n('title_resources'),
        type: 'tab-vertical',
        size: 's',
        fields: [
            {
                name: 'info',
                type: 'block',
                fullWidth: true,
                touched: true,
                extras: {
                    children: (
                        <Info className={block('info')}>
                            {UIFactory.renderTableCellBundleEditorNotice({
                                bundleData,
                                clusterUiConfig,
                            })}
                            <BundleParamsList
                                className={block('params')}
                                params={[
                                    {
                                        title: i18n('field_memory'),
                                        value: hammer.format['Bytes'](
                                            orchidData?.resource_quota.memory || '0',
                                        ),
                                    },
                                    {
                                        title: i18n('field_vcpu'),
                                        value: hammer.format['vCores'](
                                            orchidData?.resource_quota.vcpu || '0',
                                        ),
                                    },
                                    {
                                        title: i18n('field_tablet-count'),
                                        value: hammer.format.Number(
                                            initialValues.resources?.tablet_count,
                                        ),
                                    },
                                ]}
                            />
                        </Info>
                    ),
                },
            },
            ...(!allowTabletCount
                ? []
                : [
                      {
                          name: 'tablet_count',
                          type: 'bundle-input',
                          caption: i18n('field_tablet-count'),
                          extras: {
                              format: 'Number',
                              withoutDetailedBar: true,
                              progress: {
                                  usage: tabletCountUsage,
                              },
                          },
                          validator: simpleBundleValidate,
                      } as const,
                  ]),
            {section: i18n('section_rpc-proxy')},
            {
                type: 'bundle-input',
                name: 'rpc_proxy_count',
                caption: i18n('field_rpc-proxy-count'),
                extras: {
                    format: 'Number',
                    withoutDetailedBar: true,
                    hasClear: true,
                },
                tooltip: docsUrl(makeLink(UIFactory.docsUrls['dynamic-tables:cross-dc'], 'Help')),
                validator: instanceCountValidate(dcConfigurations),
            },
            {
                type: 'bundle-table-field',
                name: 'rpc_proxy_resource_guarantee',
                caption: i18n('field_instance-configuration'),
                fullWidth: true,
                extras: {
                    data: rpcConfigurations,
                },
            },
            {section: i18n('section_tablet-node')},
            {
                type: 'bundle-input',
                name: 'tablet_node_count',
                caption: i18n('field_tablet-node-count'),
                extras: {
                    format: 'Number',
                    withoutDetailedBar: true,
                    hasClear: true,
                },
                tooltip: docsUrl(makeLink(UIFactory.docsUrls['dynamic-tables:cross-dc'], 'Help')),
                validator: instanceCountValidate(dcConfigurations),
            },
            {
                type: 'bundle-table-field',
                name: 'tablet_node_resource_guarantee',
                caption: i18n('field_instance-configuration'),
                fullWidth: true,
                extras(values, {form}) {
                    const onRadioClick = (value: BundleResourceGuarantee) => {
                        const nodeConfigurationType = value.type || '';

                        const defaultMemory =
                            bundleDefaultConfig?.tablet_node_sizes[nodeConfigurationType]
                                .default_config.memory_limits || {};
                        const defaultThreadPool =
                            bundleDefaultConfig?.tablet_node_sizes[nodeConfigurationType]
                                .default_config.cpu_limits || {};
                        const defaultMemoryLimit =
                            bundleDefaultConfig?.tablet_node_sizes[nodeConfigurationType]
                                .default_config.memory_limits?.reserved || undefined;

                        const resultMemory = getBundleControllerResource(
                            values.memory_limits,
                            defaultMemory,
                            'memory_limits',
                        );
                        const resultThreadPool = getBundleControllerResource(
                            values.cpu_limits,
                            defaultThreadPool,
                            'cpu_limits',
                        );

                        resultMemory.reserved = defaultMemoryLimit;

                        form.change('memory_limits', {
                            ...bundleEditorDict.defaults.memory_limits,
                            ...resultMemory,
                        });
                        form.change('cpu_limits', {
                            ...bundleEditorDict.defaults.cpu_limits,
                            ...resultThreadPool,
                        });
                    };

                    return {
                        data: nodeConfigurations,
                        onRadioClick,
                    };
                },
            },
        ],
    };

    const renderSimpleResourceTab: DialogTabField<DialogField<BundleEditorDialogFormValues>> = {
        name: 'resources',
        title: i18n('title_resources'),
        type: 'tab-vertical',
        size: 's',
        fields: [
            {
                name: 'tablet_count',
                type: 'bundle-input',
                caption: i18n('field_tablet-count'),
                extras: {
                    format: 'Number',
                    withoutDetailedBar: true,
                    progress: {
                        usage: tabletCountUsage,
                    },
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'tablet_static_memory',
                type: 'bundle-input',
                caption: i18n('field_tablet-static-memory'),
                extras: {
                    format: 'Bytes',
                    progress: {
                        usage: tabletStaticMemoryUsage,
                    },
                },
                validator: simpleBundleValidate,
                tooltip: <span>{i18n('context_tablet-static-memory')}</span>,
            },
        ],
    };

    const renderMemoryTab: DialogTabField<DialogField<BundleEditorDialogFormValues>> = {
        name: 'memory_limits',
        title: i18n('title_memory'),
        type: 'tab-vertical',
        size: 's',
        visibilityCondition: {
            when: 'resources.tablet_node_resource_guarantee',
            isActive: (v) => typeof v !== 'undefined',
        },
        fields: [
            {
                name: 'memory_reset',
                type: 'bundle-title',
                caption: i18n('title_memory'),
                touched: true,
                extras: (allValues, {form}) => {
                    const tablet_node_resource_guarantee =
                        allValues.resources?.tablet_node_resource_guarantee;

                    const onReset = () => {
                        if (
                            !tablet_node_resource_guarantee ||
                            !tablet_node_resource_guarantee.type ||
                            !bundleDefaultConfig
                        ) {
                            return;
                        }
                        const type = tablet_node_resource_guarantee.type;
                        const {tablet_node_sizes} = bundleDefaultConfig;
                        const {memory_limits} = tablet_node_sizes[type].default_config;

                        form.change('memory_limits', {
                            ...bundleEditorDict.defaults.memory_limits,
                            ...memory_limits,
                        });
                    };

                    if (!tablet_node_resource_guarantee) {
                        return {
                            params: [],
                            onReset,
                        };
                    }
                    const {memory} = tablet_node_resource_guarantee;

                    const used = bundleEditorDict.keys.memory_limits.reduce((sum, k) => {
                        const v = allValues?.memory_limits?.[k];
                        return typeof v !== 'number' || isNaN(v) ? sum : sum + v;
                    }, 0);

                    return {
                        params: createParams('Bytes', memory, used),
                        onReset,
                    };
                },
            },
            {
                name: 'reserved',
                type: 'bundle-input',
                caption: i18n('field_reserved'),
                extras: {
                    format: 'Bytes',
                    disabled: true,
                },
                tooltip: docsUrl(
                    makeLink(UIFactory.docsUrls['bundle-controller:reserved-memory'], 'Help'),
                ),
            },
            {
                name: 'tablet_static',
                type: 'bundle-input',
                caption: i18n('field_tablet-static'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'tablet_dynamic',
                type: 'bundle-input',
                caption: i18n('field_tablet-dynamic'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'compressed_block_cache',
                type: 'bundle-input',
                caption: i18n('field_compressed-block-cache'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'uncompressed_block_cache',
                type: 'bundle-input',
                caption: i18n('field_uncompressed-block-cache'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'versioned_chunk_meta',
                type: 'bundle-input',
                caption: i18n('field_versioned-chunk-meta'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'lookup_row_cache',
                type: 'bundle-input',
                caption: i18n('field_lookup-row-cache'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
            {
                name: 'key_filter_block_cache',
                type: 'bundle-input',
                caption: i18n('field_key-filter-block-cache'),
                extras: {
                    format: 'Bytes',
                    hasClear: true,
                },
                validator: simpleBundleValidate,
            },
        ],
    };

    if (queryMemoryLimitIsSupported) {
        renderMemoryTab.fields.push({
            name: 'query',
            type: 'bundle-input',
            caption: i18n('field_query-memory-limit'),
            extras: {
                format: 'Bytes',
                hasClear: true,
            },
            validator: simpleBundleValidate,
        });
    }

    const renderThreadPoolTab: DialogTabField<DialogField<BundleEditorDialogFormValues>> = {
        name: 'cpu_limits',
        title: i18n('title_thread-pools'),
        type: 'tab-vertical',
        size: 's',
        visibilityCondition: {
            when: 'resources.tablet_node_resource_guarantee',
            isActive: (v) => typeof v !== 'undefined',
        },
        fields: [
            {
                name: 'threadPool_reset',
                type: 'bundle-title',
                caption: i18n('field_vcpu'),
                extras: (allValues, {form}) => {
                    const tablet_node_resource_guarantee =
                        allValues.resources?.tablet_node_resource_guarantee;

                    if (
                        !tablet_node_resource_guarantee ||
                        !tablet_node_resource_guarantee.type ||
                        !bundleDefaultConfig
                    ) {
                        return {
                            params: [],
                            onReset: () => {},
                        };
                    }

                    const onReset = () => {
                        const type = tablet_node_resource_guarantee.type;
                        if (!type) {
                            return;
                        }

                        const {tablet_node_sizes} = bundleDefaultConfig;
                        const {cpu_limits} = tablet_node_sizes[type].default_config;

                        form.change('cpu_limits', {
                            ...bundleEditorDict.defaults.cpu_limits,
                            ...cpu_limits,
                        });
                    };

                    const {vcpu} = tablet_node_resource_guarantee;

                    return {
                        params: createParams('vCores', vcpu),
                        onReset,
                    };
                },
            },
            {
                name: 'lookup_thread_pool_size',
                type: 'bundle-input',
                caption: i18n('field_lookup-thread-pool-size'),
                extras: {
                    postfix: i18n('field_threads'),
                    format: 'Number',
                    hasClear: true,
                },
                validator: validateNumber.bind(null, {gt: 0}),
            },
            {
                name: 'query_thread_pool_size',
                type: 'bundle-input',
                caption: i18n('field_query-thread-pool-size'),
                extras: {
                    postfix: i18n('field_threads'),
                    format: 'Number',
                    hasClear: true,
                },
                validator: validateNumber.bind(null, {gt: 0}),
            },
            {
                name: 'write_thread_pool_size',
                type: 'bundle-input',
                caption: i18n('field_tablet-cells-per-node'),
                warning: i18n('alert_tablet-cells-discouraged'),
                extras: {
                    postfix: i18n('field_threads'),
                    format: 'Number',
                    hasClear: true,
                },
                validator: validateNumber.bind(null, {gt: 0}),
            },
        ],
    };

    const fields = [renderGeneralTabs];
    if (enableBundleController) {
        fields.push(renderResourceTab, renderMemoryTab, renderThreadPoolTab);
    } else {
        fields.push(renderSimpleResourceTab);
    }

    const dispatch = useDispatch();
    const onClose = () => {
        dispatch(hideTabletCellBundleEditor());
    };

    const onSubmit = async (form: FormApi<BundleEditorDialogFormValues>) => {
        if (!bundleName) {
            return {};
        }

        const preparedData = prepareSubmitBundle(form);

        try {
            await dispatch(
                setBundleEditorController({
                    bundleName,
                    data: preparedData,
                }),
            );
            return undefined;
        } catch (error: any) {
            return makeFormSubmitError(error);
        }
    };

    if (isEmpty_(data)) {
        return null;
    }

    return (
        <YTDFDialog<BundleEditorDialogFormValues>
            className={block('dialog')}
            headerProps={{
                title: bundleName,
            }}
            size="l"
            initialValues={initialValues}
            visible={visibleEditor}
            onAdd={onSubmit}
            onClose={onClose}
            fields={fields}
            validate={validateFormValues.bind(null, orchidData?.resource_quota)}
        />
    );
}

function validateFormValues(
    quota: OrchidBundleResource | undefined,
    values: BundleEditorDialogFormValues,
) {
    const res: Pick2<typeof values, 'resources', 'info', string | undefined> &
        Pick2<typeof values, 'memory_limits', 'memory_reset', string | undefined> = {
        resources: {info: undefined},
        memory_limits: {memory_reset: undefined},
    };

    const {resources} = values;

    const currentAccLimit = Object.values(values.memory_limits || {}).reduce(
        (acc: number, v: number | boolean) => {
            if (typeof v !== 'number') {
                return acc;
            }
            return acc + v;
        },
        0,
    );

    const tabletNode = resources.tablet_node_resource_guarantee;
    res.memory_limits.memory_reset =
        currentAccLimit > (tabletNode?.memory ?? 0)
            ? i18n('alert_memory-limits-exceeded')
            : undefined;

    const {rpc_proxy_count = 0, tablet_node_count = 0} = resources;

    const requiredCpu =
        (tabletNode?.vcpu ?? 0) * tablet_node_count +
        (resources.rpc_proxy_resource_guarantee?.vcpu ?? 0) * rpc_proxy_count;

    const violatedResources = [];

    if (requiredCpu > quota?.vcpu!) {
        violatedResources.push(i18n('alert_cpu-required', {cpu: hammer.format.Number(requiredCpu / 1000)}));
    }

    const requiredMemory =
        (tabletNode?.memory ?? 0) * tablet_node_count +
        (resources.rpc_proxy_resource_guarantee?.memory ?? 0) * rpc_proxy_count;

    if (requiredMemory > quota?.memory!) {
        violatedResources.push(i18n('alert_memory-required', {memory: hammer.format.Bytes(requiredMemory)}));
    }

    res.resources.info = violatedResources.length ? violatedResources.join(', ') : undefined;

    return res;
}
