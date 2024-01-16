import _ from 'lodash';
import ypath from '../../../../common/thor/ypath';
import hammer from '../../../../common/hammer';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
    BundleControllerConfig,
    BundleDataCenter,
    BundleDefaultConfigData,
} from '../../../../store/reducers/tablet_cell_bundles';
import {BundleParam} from '../../../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/components/BundleParamsList/BundleParamsList';
import {BundleEditorDialogFormValues} from '../../../../pages/tablet_cell_bundles/bundles/BundleEditorDialog/BundleEditorDialog';
import {FormApi} from '../../../../components/Dialog/Dialog';

type InnerKeys<T> = {[K in keyof T]: Array<keyof T[K]>};
type FormKeys = InnerKeys<Required<BundleEditorDialogFormValues>>;

export const bundleEditorDict: {
    keys: Pick<FormKeys, 'memory_limits' | 'resources' | 'cpu_limits'>;
    defaults: Pick<Required<BundleEditorDialogFormValues>, 'memory_limits' | 'cpu_limits'>;
} = {
    keys: {
        resources: [
            'rpc_proxy_count',
            'rpc_proxy_resource_guarantee',
            'tablet_node_count',
            'tablet_node_resource_guarantee',
        ],
        memory_limits: [
            'reserved',
            'tablet_static',
            'tablet_dynamic',
            'compressed_block_cache',
            'uncompressed_block_cache',
            'versioned_chunk_meta',
            'lookup_row_cache',
            'key_filter_block_cache',
        ],
        cpu_limits: ['lookup_thread_pool_size', 'query_thread_pool_size', 'write_thread_pool_size'],
    },
    defaults: {
        memory_limits: {
            error: false,
            memory_reset: false,
            tablet_static: 0,
            tablet_dynamic: 0,
            compressed_block_cache: 0,
            uncompressed_block_cache: 0,
            versioned_chunk_meta: 0,
            lookup_row_cache: 0,
            key_filter_block_cache: 0,
        },
        cpu_limits: {
            threadPool_reset: false,
            lookup_thread_pool_size: 0,
            query_thread_pool_size: 0,
            write_thread_pool_size: 0,
        },
    },
};

export const getResourceData = (source: object, resourceType: string) => {
    const usage = ypath.getValue(source, `/@resource_usage/${resourceType}`);
    const limit = ypath.getValue(source, `/@resource_limits/${resourceType}`);
    return {
        usage,
        limit,
    };
};

export const getInitialFormValues = (
    data: object,
    bundleControllerConfig?: BundleControllerConfig,
): Partial<BundleEditorDialogFormValues> => {
    const slug = ypath.getValue(data, '/@abc/slug');
    const changelogAccount = ypath.getValue(data, `/@options/changelog_account`);
    const snapshotAccount = ypath.getValue(data, `/@options/snapshot_account`);
    const {limit: tablet_count} = getResourceData(data, 'tablet_count');
    const {limit: tablet_static_memory} = getResourceData(data, 'tablet_static_memory');

    if (!bundleControllerConfig) {
        return {
            general: {
                abc: {slug},
                changelog_account: changelogAccount,
                snapshot_account: snapshotAccount,
            },
            resources: {
                tablet_count: tablet_count || 0,
                tablet_static_memory: tablet_static_memory || 0,
            },
        };
    }

    const {
        rpc_proxy_count,
        tablet_node_count,
        cpu_limits,
        memory_limits,
        rpc_proxy_resource_guarantee,
        tablet_node_resource_guarantee,
    } = bundleControllerConfig;

    return {
        general: {
            abc: {slug},
            changelog_account: changelogAccount,
            snapshot_account: snapshotAccount,
        },
        resources: {
            info: '', // system
            tablet_count: tablet_count || 0,
            rpc_proxy_count: rpc_proxy_count, // todo
            rpc_proxy_resource_guarantee: rpc_proxy_resource_guarantee || undefined,
            tablet_node_count: tablet_node_count,
            tablet_node_resource_guarantee: tablet_node_resource_guarantee || undefined,
        },
        memory_limits: {
            error: false, // system
            memory_reset: false, // system
            reserved: memory_limits?.reserved || 0,
            tablet_static: memory_limits?.tablet_static || 0,
            tablet_dynamic: memory_limits?.tablet_dynamic || 0,
            compressed_block_cache: memory_limits?.compressed_block_cache || 0,
            uncompressed_block_cache: memory_limits?.uncompressed_block_cache || 0,
            versioned_chunk_meta: memory_limits?.versioned_chunk_meta || 0,
            lookup_row_cache: memory_limits?.lookup_row_cache || 0,
            key_filter_block_cache: memory_limits?.key_filter_block_cache || 0,
        },
        cpu_limits: {
            threadPool_reset: false, //system
            lookup_thread_pool_size: cpu_limits?.lookup_thread_pool_size || 0,
            query_thread_pool_size: cpu_limits?.query_thread_pool_size || 0,
            write_thread_pool_size: cpu_limits?.write_thread_pool_size || 0,
        },
    };
};

function formatNetwork(value?: number) {
    const formatted = typeof value !== 'undefined' ? (value / 1000e6).toPrecision(2) : 0;
    return `${formatted} Gbit RX/TX`;
}

export const createConfigurationList = (
    data: BundleDefaultConfigData['rpc_proxy_sizes'] | BundleDefaultConfigData['tablet_node_sizes'],
) => {
    return Object.entries(data).map(([type, itemData]) => {
        const {net, vcpu, memory} = itemData.resource_guarantee;
        return {
            id: type,
            type,
            memory: hammer.format['Bytes'](memory),
            net: formatNetwork(net),
            vcpu: hammer.format['vCores'](vcpu),
            initialData: {...itemData.resource_guarantee, type},
        };
    });
};

export const createParams = (formatType: 'Bytes' | 'vCores', total: number, used?: number) => {
    const [totalVal, totalPref] = hammer.format[formatType](total).split(' ');
    const params: BundleParam[] = [{title: 'Total', value: totalVal, postfix: totalPref}];

    if (typeof used !== 'undefined') {
        const difference = total - used;
        const [usedVal, usedPref] = hammer.format[formatType](difference).split(' ');
        params.push({
            title: 'Free',
            value: usedVal === hammer.format.NO_VALUE ? '0' : usedVal,
            postfix: usedPref,
            type: difference >= 0 ? 'positive' : 'negative',
        });
    }
    return params;
};

function prepareAbc(value: {id: number; slug: string}) {
    const {id, slug} = value;
    return id && slug ? {id, slug} : undefined;
}

export const prepareSubmitBundle = (form: FormApi<BundleEditorDialogFormValues>) => {
    const prepare: {[path: string]: any} = {};
    const {dirtyFields, values} = form.getState();

    function addToChange(attr: string, field: string, prepareValue?: Function) {
        if (!dirtyFields[field]) {
            return;
        }
        const value = _.get(values, field);
        prepare[attr] = typeof prepareValue === 'function' ? prepareValue(value) : value;
    }

    // Generel
    addToChange('@abc', 'general.abc', prepareAbc);
    addToChange('@options/changelog_account', 'general.changelog_account');
    addToChange('@options/snapshot_account', 'general.snapshot_account');
    // Resources
    addToChange('@resource_limits/tablet_count', 'resources.tablet_count');
    addToChange('@resource_limits/tablet_static_memory', 'resources.tablet_static_memory');
    addToChange('@bundle_controller_target_config/rpc_proxy_count', 'resources.rpc_proxy_count');
    addToChange(
        '@bundle_controller_target_config/tablet_node_count',
        'resources.tablet_node_count',
    );
    addToChange(
        '@bundle_controller_target_config/rpc_proxy_resource_guarantee',
        'resources.rpc_proxy_resource_guarantee',
    );
    addToChange(
        '@bundle_controller_target_config/tablet_node_resource_guarantee',
        'resources.tablet_node_resource_guarantee',
    );
    // Memory_limits
    addToChange(
        '@bundle_controller_target_config/memory_limits/tablet_static',
        'memory_limits.tablet_static',
    );
    addToChange(
        '@bundle_controller_target_config/memory_limits/tablet_dynamic',
        'memory_limits.tablet_dynamic',
    );
    addToChange(
        '@bundle_controller_target_config/memory_limits/compressed_block_cache',
        'memory_limits.compressed_block_cache',
    );
    addToChange(
        '@bundle_controller_target_config/memory_limits/uncompressed_block_cache',
        'memory_limits.uncompressed_block_cache',
    );
    addToChange(
        '@bundle_controller_target_config/memory_limits/versioned_chunk_meta',
        'memory_limits.versioned_chunk_meta',
    );
    addToChange(
        '@bundle_controller_target_config/memory_limits/lookup_row_cache',
        'memory_limits.lookup_row_cache',
    );
    addToChange(
        '@bundle_controller_target_config/memory_limits/key_filter_block_cache',
        'memory_limits.key_filter_block_cache',
    );
    // Cpu_limits
    addToChange(
        '@bundle_controller_target_config/cpu_limits/lookup_thread_pool_size',
        'cpu_limits.lookup_thread_pool_size',
    );
    addToChange(
        '@bundle_controller_target_config/cpu_limits/query_thread_pool_size',
        'cpu_limits.query_thread_pool_size',
    );
    addToChange(
        '@bundle_controller_target_config/cpu_limits/write_thread_pool_size',
        'cpu_limits.write_thread_pool_size',
    );

    return prepare;
};

export const simpleBundleValidate = (v?: number | string) => {
    const toNumber = Number(v);
    let error;
    if (!Number.isFinite(toNumber)) {
        error = 'Incorrect value';
    }

    if (toNumber < 0) {
        error = 'Must be greater than or equal to zero';
    }

    return error;
};

export const dcBundleValidate = ({
    length,
}: BundleDataCenter[]): ((input?: number | string) => string | undefined) => {
    return (input?: number | string): string | undefined => {
        const number = Number(input);
        let error: string | undefined;

        if (!Number.isFinite(number)) {
            error = 'Incorrect value';
        } else if (number < 0) {
            error = 'Must be greater than or equal to zero';
        } else if (length > 0 && number % length !== 0) {
            error = `Must divide the number of data centers (${length})`;
        }

        return error;
    };
};

export function getBundleControllerResource<K extends 'cpu_limits' | 'memory_limits'>(
    current: Partial<Required<BundleEditorDialogFormValues>[K]>,
    defaultValues: Partial<Required<BundleEditorDialogFormValues>[K]>,
    resourceName: K,
) {
    const result: Partial<BundleEditorDialogFormValues[K]> = {};

    for (const key of bundleEditorDict.keys[resourceName]) {
        result[key] = current[key] ?? defaultValues[key];
    }

    return result;
}
