import cloneDeep_ from 'lodash/cloneDeep';
import forEach_ from 'lodash/forEach';
import isEqual_ from 'lodash/isEqual';
import isEmpty_ from 'lodash/isEmpty';
import map_ from 'lodash/map';
import partition_ from 'lodash/partition';

// @ts-ignore
import yt from '@ytsaurus/javascript-wrapper/lib/yt';

import {SELECT_EMPTY_VALUE} from '../constants/navigation/modals/create-table';
import {SelectWithSubItemsProps} from '../components/Dialog/controls/SelectWithSubItems/SelectWithSubItems';
import {wrapBatchPromise} from './utils';
import {YTApiId, ytApiV3Id} from '../rum/rum-wrap-api';
import {BatchSubRequest, GetParams} from '../../shared/yt-types';
import {ValueOf} from '../../@types/types';

export interface WithAttrs<T> {
    $attributes: T;
}

export const compressionExtras: Pick<SelectWithSubItemsProps, 'labels' | 'items' | 'subItemsMap'> =
    {
        labels: ['codec:', 'level:'],
        items: [
            ...[
                'none',
                'snappy',
                'zlib_',
                'lz4',
                'lz4_high_compression',
                'quick_lz',
                'zstd_',
                'brotli_',
                'lzma_',
                'bzip2_',
            ].map((value) => ({value, content: value})),
        ],
        subItemsMap: {
            zlib_: genComperessionLevelItems(1, 9),
            zstd_: genComperessionLevelItems(1, 21),
            brotli_: genComperessionLevelItems(1, 11),
            lzma_: genComperessionLevelItems(0, 9),
            bzip2_: genComperessionLevelItems(1, 9),
        },
    };

function genComperessionLevelItems(from: number, to: number) {
    const res = [];
    for (let i = from; i <= to; ++i) {
        res.push({value: String(i), content: String(i)});
    }
    return res;
}

export function compressionCodecValueFromString(value: string) {
    if (!value) {
        return [SELECT_EMPTY_VALUE];
    }

    for (const k in compressionExtras.subItemsMap) {
        if (value.startsWith(k)) {
            return [k, value.substr(k.length)];
        }
    }
    return [value];
}

export function compressionCodecValueToString(value: Array<string>) {
    if (isEqual_(value, [SELECT_EMPTY_VALUE])) {
        return '';
    }
    return value?.join('');
}

type StorageOptionsType = 'replication' | 'erasure';

export const StorageOptions = {
    REPLICATION: 'replication' as StorageOptionsType,
    ERASURE: 'erasure' as StorageOptionsType,
};

export const ERASURE_CODECS = [
    {value: 'lrc_12_2_2', title: 'lrc_12_2_2 (recommended)'},
    {value: 'reed_solomon_6_3', title: 'reed_solomon_6_3'},
];

export function storageOptionFromErasureCodec(codec: string) {
    return !codec || codec === 'none' ? StorageOptions.REPLICATION : StorageOptions.ERASURE;
}

export function normalizeErasureCodec(erasureCodec: string) {
    return !erasureCodec || erasureCodec === 'none' ? ERASURE_CODECS[0].value : erasureCodec;
}

export function erasureCodecFromStorageOption(type?: StorageOptionsType, erasureCodec?: string) {
    if (type === StorageOptions.REPLICATION) {
        return 'none';
    }
    return erasureCodec || ERASURE_CODECS[0].value;
}

export type InMemoryModeType = ValueOf<typeof InMemoryMode>;

export const InMemoryMode = {
    NONE: 'none',
    COMPRESSED: 'compressed',
    UNCOMPRESSED: 'uncompressed',
} as const;

export function makeUiMarker(ui_marker: string) {
    return {ui_marker};
}

export function prepareSetCommandForBatch(path: string, value: any, additionalParameters?: object) {
    if (value === undefined || value === null) {
        return {
            command: 'remove' as const,
            parameters: {
                path,
                ...additionalParameters,
            },
        };
    }

    return {
        command: 'set' as const,
        parameters: {
            path,
            ...additionalParameters,
            force: true,
        },
        input: value,
    };
}

export const CypressNodeTypes = {
    REPLICATED_TABLE: 'replicated_table',
    REPLICATION_LOG_TABLE: 'replication_log_table',
    CHAOS_REPLICATED_TABLE: 'chaos_replicated_table',
    MAP_NODE: 'map_node',
    TABLE: 'table',
    // TODO: add more types
};

export async function createParentsBeforeSet(nodePath: string, attributesToSet: Array<string>) {
    if (!attributesToSet.length) {
        return Promise.resolve();
    }

    const parentPaths: Record<string, boolean> = {};
    forEach_(attributesToSet, (attr) => {
        const parents = attr.split('/');
        for (let i = 1; i < parents.length; ++i) {
            const key = parents.slice(0, i).join('/');
            if (key) {
                parentPaths[key] = true;
            }
        }
    });
    const toCreate = Object.keys(parentPaths).sort();

    for (const attr of toCreate) {
        const path = nodePath + '/@' + attr;
        await yt.v3.exists({path}).then((isCreated: boolean) => {
            if (!isCreated) {
                return yt.v3.set({path}, {});
            }
        });
    }
}

export function updateNodeAttributes(
    nodePath: string,
    changes: Array<{attr: string; value: any}>,
): Promise<unknown> {
    if (isEmpty_(changes)) {
        return Promise.resolve();
    }

    const requests: Array<BatchSubRequest> = [];

    const oneLevelDiffsParents: Array<string> = [];
    const oneLevelDiffs: Record<string, Record<string, unknown>> = {};
    forEach_(changes, ({attr, value}) => {
        const attrPath = attr.split('/');
        if (attrPath.length === 1) {
            const path = nodePath + '/@' + attrPath.join('/');
            requests.push(prepareSetCommandForBatch(path, value));
        } else {
            const [last] = attrPath.splice(attrPath.length - 1, 1);
            const parentPath = attrPath.join('/');
            oneLevelDiffsParents.push(parentPath);
            const path = nodePath + '/@' + parentPath;
            const diff = (oneLevelDiffs[path] = oneLevelDiffs[path] || {});
            diff[last] = value;
        }
    });

    return Promise.all([
        ...(requests.length
            ? [
                  wrapBatchPromise(
                      ytApiV3Id.executeBatch(YTApiId.updateNodeAttributes, {requests}),
                      'Failed to update node attributes',
                  ),
              ]
            : []),
        createParentsBeforeSet(nodePath, oneLevelDiffsParents).then(() => {
            if (isEmpty_(oneLevelDiffs)) {
                return Promise.resolve([]);
            }

            const promises: Array<Promise<unknown>> = map_(oneLevelDiffs, async (diff, path) => {
                const p = updateAttributes(path, diff);
                await p;
                return p;
            });

            return Promise.all(promises);
        }),
    ]);
}

function updateAttributes(path: string, oneLevelDiff: Record<'string', unknown>) {
    if (isEmpty_(oneLevelDiff)) {
        return Promise.resolve();
    }

    const modifyGuarantee = (data: any = {}) => {
        const res = cloneDeep_(data);
        forEach_(oneLevelDiff, (value, key) => {
            if (value === undefined) {
                delete res[key];
            } else {
                res[key] = value;
            }
        });
        if (isEqual_(data, res)) {
            return Promise.resolve();
        }
        return yt.v3.set({path}, res);
    };

    return yt.v3.exists({path}).then((isExists: boolean) => {
        if (isExists) {
            return ytApiV3Id.get(YTApiId.updateAttributes, {path}).then(modifyGuarantee);
        }
        return modifyGuarantee({});
    });
}

export function makeBatchSubRequest<T extends BatchSubRequest>(
    command: T['command'],
    parameters: T['parameters'],
    setup?: T['setup'],
) {
    return {
        command,
        parameters,
        setup,
    } as BatchSubRequest;
}

export function prepareAttributes(attributes: readonly string[]): GetParams['attributes'] {
    const [keys, paths] = partition_(attributes, (k) => -1 === k.indexOf('/'));

    if (!paths.length) {
        return keys;
    }

    return {keys, paths};
}
