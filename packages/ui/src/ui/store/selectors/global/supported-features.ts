import {createSelector} from 'reselect';

import find_ from 'lodash/find';
import forEach_ from 'lodash/forEach';
import map_ from 'lodash/map';
import sortBy_ from 'lodash/sortBy';

import {RootState} from '../../../store/reducers';
import {getCluster} from './index';
import {SelectWithSubItemsProps} from '../../../components/Dialog/controls/SelectWithSubItems/SelectWithSubItems';
import {OperationStatisticInfo} from '../../../store/reducers/global/supported-features';

const getSupportedFeaturesRaw = (state: RootState) => state.supportedFeatures.features;
const getSupportedFeaturesCluster = (state: RootState) => state.supportedFeatures.featuresCluster;

//                                    Record<codec, level>
const RECOMMENDED_COMPRESSION_CODECS: Record<string, string> = {
    lz4: '',
    zstd_: '5',
    zlib_: '9',
    brotli_: '8',
    lzma_: '6',
};

const RECOMMENDED = ' (recommended)';

const getSupportedFeatures = createSelector(
    [getCluster, getSupportedFeaturesCluster, getSupportedFeaturesRaw],
    (cluster, featuresCluster, features) => {
        return cluster === featuresCluster ? features : {};
    },
);

export const getErasureCodecs = createSelector([getSupportedFeatures], (features) => {
    return map_(features.erasure_codecs, (value) => {
        return {value, text: value};
    }).sort(compareItems);
});

export const getPrimitiveTypes = createSelector([getSupportedFeatures], (features) => {
    return sortBy_(features.primitive_types).map((value) => {
        return {value, text: value};
    });
});

export const getPrimitiveTypesMap = createSelector([getPrimitiveTypes], (types) => {
    return new Set(types.map(({value}) => value));
});

export const getCompressionCodecs = createSelector([getSupportedFeatures], (features) => {
    return prepareItemsSubitems(features.compression_codecs);
});

export const makeCompressionCodecFinder = createSelector([getCompressionCodecs], ({items}) => {
    return (codec: string) => {
        if (!codec) {
            return undefined;
        }

        const item = find_(items, (x) => {
            return x.value === codec;
        });
        if (item) {
            return [item.value as string];
        }

        const [first, ...rest] = codec.split('_');
        const subCodec = rest.join('_');

        return [first + '_', subCodec];
    };
});

export type CompressionCodecs = Required<
    Pick<SelectWithSubItemsProps, 'items' | 'subItemsMap' | 'labels'>
>;

function prepareItemsSubitems(arr: Array<string> = []): CompressionCodecs {
    const res: CompressionCodecs = {
        items: [],
        subItemsMap: {},
        labels: ['Codec:', 'level:'],
    };

    const {items, subItemsMap} = res;

    for (const item of arr) {
        const match = item.match(/^(.+_)(\d+)$/);

        if (match) {
            const value = match[1];
            const subValue = match[2];

            if (!subItemsMap[value]) {
                items.push({value, content: value});
            }

            const dst = (subItemsMap[value] = subItemsMap[value] || new Array<string>());
            dst.push({value: subValue, content: subValue});
        } else {
            items.push({value: item, content: item});
        }
    }

    forEach_(subItemsMap, (subItems, key) => {
        const index = items.findIndex(({value}) => value === key);
        if (index === -1) {
            return;
        }
        subItems.sort(compareItems);
        if (subItems.length === 1) {
            const value = items[index].value + subItems[0].value;
            items[index] = {value, content: value};
            delete subItemsMap[key];
        } else {
            const item = items[index];
            item.content = `${item.value}[${subItems[0].value}-${
                subItems[subItems.length - 1].value
            }]`;
        }

        const recommended = RECOMMENDED_COMPRESSION_CODECS[key];
        if (recommended) {
            const subItems2 = subItemsMap[key];
            if (subItems2) {
                const first = subItems2[0];
                const last = subItems2[subItems2.length - 1];
                first.content = first.value + ' (faster)';
                last.content = last.value + ' (slower & smaller)';

                const item = subItems2.find(({value}) => value === recommended);
                if (item) {
                    item.content = item.value + RECOMMENDED;
                }
            } else {
                items[index].content += RECOMMENDED;
            }
        }
    });

    items.sort(compareItems);
    return res;
}

function compareItems(l: {value: string}, r: {value: string}) {
    if (l.value === r.value) {
        return 0;
    }

    if (l.value === 'none') {
        return -1;
    }

    if (r.value === 'none') {
        return 1;
    }

    const lValue = String(Number(l.value)) === l.value ? Number(l.value) : l.value;
    const rValue = String(Number(r.value)) === r.value ? Number(r.value) : r.value;

    return lValue < rValue ? -1 : 1;
}

export const getOperationStatisticsDescription = createSelector(
    [getSupportedFeaturesRaw],
    ({operation_statistics_descriptions}) => {
        const byName: Record<string, OperationStatisticInfo> = {};
        const byRegexp: Array<OperationStatisticInfo & {regexp: RegExp}> = [];
        forEach_(operation_statistics_descriptions, (item, key) => {
            const idx = key.indexOf('*');
            if (idx !== -1) {
                const tmp = key.replace(/\//g, '\\/').replace(/\*/g, '[^/]*');
                byRegexp.push({
                    ...item,
                    regexp: new RegExp(tmp),
                });
            } else {
                byName[key] = item;
            }
        });

        const cache = new Map<string, OperationStatisticInfo | undefined>();
        function putToCache(key: string, info?: OperationStatisticInfo) {
            cache.set(key, info);
            return info;
        }

        return {
            getStatisticInfo: (name: string) => {
                if (cache.has(name)) {
                    return cache.get(name);
                }

                const key = name.startsWith('<Root>/') ? name.substring('<Root>/'.length) : name;
                const res = key.endsWith('/$$')
                    ? byName[key.substring(0, key.length - 3)]
                    : byName[key];
                if (res) {
                    return putToCache(name, res);
                }

                return putToCache(
                    name,
                    find_(byRegexp, ({regexp}) => {
                        return regexp.test(key);
                    }),
                );
            },
        };
    },
);

export const getRequirePasswordInAuthenticationCommands = createSelector(
    [getSupportedFeatures],
    (features) => features.require_password_in_authentication_commands,
);

export const getQueryMemoryLimitIsSupported = createSelector([getSupportedFeatures], (features) => {
    return features.query_memory_limit_in_tablet_nodes || false;
});
