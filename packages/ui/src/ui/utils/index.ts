import _ from 'lodash';
// @ts-expect-error
import yt from '@ytsaurus/javascript-wrapper/lib/yt';
import hammer from '../common/hammer';
// @ts-expect-error
import unipika from '@gravity-ui/unipika/lib/unipika';
import qs from 'qs';
import encodeValue from '../common/utils/url-encoder';
import Cookies from 'js-cookie';
import type {Settings} from '../components/Yson/StructuredYson/StructuredYsonTypes';
import type {ClusterConfig, YTConfig} from '../../shared/yt-types';

export const flags = new Map<'false' | 'FALSE' | false | 'true' | 'TRUE' | true, boolean>([
    ['false', false],
    ['FALSE', false],
    [false, false],
    ['true', true],
    ['TRUE', true],
    [true, true],
]);

export function prepareAttributes(attributes: any, settings: Settings): unknown {
    const getPreparedValue = <T>({$attributes}: any, value: T) => {
        if (!$attributes) {
            return value;
        }

        return {
            $attributes: prepareAttributes($attributes, {}),
            $value: value,
        };
    };

    const prepareAttribute = (attribute: {$type: string; $value: any}) => {
        if (!attribute) {
            return null;
        } else if (typeof attribute === 'object' && !attribute.$type) {
            return prepareAttributes(attribute, settings);
        }

        switch (attribute.$type) {
            case 'null':
                return getPreparedValue(attribute, null);

            case 'string':
                return getPreparedValue(attribute, attribute.$value);

            case 'boolean':
                return getPreparedValue(attribute, flags.get(attribute.$value));

            case 'int64':
            case 'uint64':
                // TODO: use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt
                return getPreparedValue(attribute, Number(attribute.$value));

            case 'number':
            case 'double':
                return getPreparedValue(attribute, Number(attribute.$value));

            case 'map':
            case 'list': {
                const value = prepareAttributes(attribute.$value, settings);

                return getPreparedValue(attribute, value);
            }

            default:
                prepareAttributes(attribute.$value, unipika.formatFromYSON(attribute, settings));
        }
    };

    return Array.isArray(attributes)
        ? _.map(attributes, prepareAttribute)
        : _.mapValues(attributes, prepareAttribute);
}

function normalizeItemWithAttributes(item: any): unknown {
    // when there is no any requested attributes
    // the response contains only entity name
    if (typeof item === 'string') {
        return {$value: item, $attributes: {}};
    }
    return item;
}

export function normalizeResponseWithAttributes(data: any): unknown {
    return !Array.isArray(data)
        ? normalizeItemWithAttributes(data)
        : _.map(data, normalizeItemWithAttributes);
}

export function formatCounterName(name: string): string {
    const caption =
        {
            alerts: 'alrt',
            decommissioned: 'dec',
            full: 'full',
        }[name] || name;
    return hammer.format['Readable'](caption, {delimiter: '-'});
}

export function getCounterAction(tab: string, type?: 'state' | 'flags', name?: string): unknown {
    let filterName;
    let filterValue;

    if (type === 'state') {
        filterName = type;
        filterValue = name;
    } else if (type === 'flags') {
        filterName = name;
        filterValue = true;
    }

    const action: Record<string, string | boolean | undefined> = {tab: tab};

    if (filterName) {
        action[filterName] = filterValue;
    }

    return hammer.utils.getState('components', action);
}

// @ts-expect-error
export function sortStateProgress(progress): unknown {
    return hammer.utils.sortInPredefinedOrder(
        ['success', 'warning', 'danger', 'default'],
        progress,
        'theme',
    );
}

// @ts-expect-error
export function computeEffectiveStateProgress(counters): unknown {
    const total = counters.total;

    return sortStateProgress(
        _.map(counters.effectiveStates, (count, state) => {
            return {
                value: total && (count / total) * 100,
                title: 'State: ' + state,
                theme:
                    {
                        online: 'success',
                        banned: 'warning',
                        offline: 'danger',
                    }[state] || 'default',
            };
        }),
    );
}

// @ts-expect-error
export function getDisplayName(WrappedComponent): string {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
}

export type TabSettings = {
    show?: boolean;
    counter?: number;
    url?: string;
    routed?: boolean;
    external?: boolean;
};

export function makeTabProps<TabName extends string>(
    path: string,
    Tab: Record<string, TabName>,
    settings?: Partial<Record<TabName, TabSettings>>,
    queryParams?: any,
    titleDict: Partial<Record<TabName, string>> = {},
) {
    return {
        items: Object.values(Tab).map<{
            value: string;
            text: any;
            show?: boolean;
            url: string;
            count?: number;
        }>((key) => {
            const query = queryParams ? `?${qs.stringify(queryParams)}` : '';

            const {
                show = true,
                url = `${path}/${key}${query}`,
                counter,
                routed,
                external,
            } = settings?.[key] ?? {};

            return {
                value: key,
                text: titleDict[key] || hammer.format['ReadableField'](key),
                show,
                url,
                counter,
                routed,
                external,
            };
        }),
        underline: true,
        size: 'l',
    };
}

export function makeRadioButtonProps(items: string[], allItemValue?: string) {
    const res = _.map(items, (value) => {
        return {
            value,
            text: hammer.format['ReadableField'](value),
        };
    });

    if (allItemValue !== undefined) {
        res.splice(0, 0, {value: allItemValue, text: 'All'});
    }
    return res;
}

export function makeRadioButtonPropsByKey(items: {[k: string]: string}) {
    return Object.entries(items).map(([k, value]) => {
        const text = hammer.format['ReadableField'](k.toLowerCase());
        return {
            value,
            text,
            content: text,
        };
    });
}

export function isPaneSplit({isSplit, type}: {isSplit: boolean; type: string}, splitType: string) {
    return Boolean(isSplit && type === splitType);
}

export function valueOrDefault<T>(value: T, defaultValue: T): T {
    return typeof value === 'undefined' ? defaultValue : value;
}

export function prepareTableColumns<T extends {caption?: string}>(columns: Record<string, T>) {
    return _.reduce(
        columns,
        (preparedColumns, column, name) => {
            preparedColumns[name] = {...column, name, caption: column.caption};

            return preparedColumns;
        },
        {} as Record<string, T & {name: string}>,
    );
}

export function parseBytes(input: string): number {
    const names = ['B', 'K', 'M', 'G', 'T', 'P', 'E'];
    const formatRegex = new RegExp('^((\\d*[.])?\\d+)( *[' + names.join('') + '])(iB)?(/s)?$', 'i');

    if (formatRegex.test(input)) {
        const match = input.match(formatRegex)!;
        const value = match[1];
        const dimension = match[3].trim();
        const dimensionIndex = _.findIndex(
            names,
            (name) => name.toUpperCase() === dimension.toUpperCase(),
        );

        return Math.floor(Number(value) * Math.pow(2, 10 * dimensionIndex));
    } else {
        return Math.floor(Number(input));
    }
}

export function parseSortState(stringSortState: string) {
    const values = _.map(stringSortState.split(','), (value) => value.split('-'));
    const parsed = _.fromPairs(values);

    parsed.asc = flags.get(parsed.asc);

    if (parsed.undefinedAsc !== undefined) {
        parsed.undefinedAsc = flags.get(parsed.undefinedAsc);
    }

    return parsed;
}

export function getXsrfCookieName(cluster: string): string {
    return `ytfront_${cluster}_xsrf_token`;
}

export function getXsrfCookieValue(cluster: string) {
    const name = getXsrfCookieName(cluster);
    return Cookies.get(name);
}

export function getClusterConfig(clusters: YTConfig['clusters'], cluster: string): ClusterConfig {
    if (Object.hasOwnProperty.call(clusters, cluster)) {
        return clusters[cluster];
    } else {
        // @ts-expect-error
        return {};
    }
}

export function prepareHost(host?: string): string {
    if (!host) {
        return '';
    }
    const res = (host || '').match(/^[^-.]+(-[^-.]+)?/gi);
    return (res && res[0]) || '';
}

export function pluralize(count: number, single: string, plural: string): string {
    return count === 1 ? single : plural;
}

// @ts-expect-error
export function computeStateQuery(state): string {
    const {cluster, page, tab, ...params} = state;
    const baseUrl = `/${cluster}/${page}` + (tab ? `/${tab}` : '');
    if (params.t === null) {
        delete params.t;
    }
    // TODO: here we should tranlate params taken from redux state into query params via RLS paramSetup
    const query = qs.stringify(params, {encoder: encodeValue});

    return `${baseUrl}?${query}`;
}

export function paramsToQuery(params: any): string {
    return qs.stringify(params, {encoder: encodeValue});
}

export function isNull(value: any): boolean {
    return value === null || value === undefined;
}

const FUTILE_RETRY_CODES: number[] = [
    yt.codes.NO_SUCH_USER,
    yt.codes.USER_IS_BANNED,
    yt.codes.PERMISSION_DENIED,
];

export function isRetryFutile(errCode: number) {
    return FUTILE_RETRY_CODES.indexOf(errCode) !== -1;
}

export function lastWord(v = ' ', delimeter = ' ') {
    const lastSpaceIndex = v.lastIndexOf(delimeter);
    if (lastSpaceIndex === -1) {
        return {lastSpaceIndex};
    }
    return {
        lastSpaceIndex,
        suffix: v.substring(lastSpaceIndex + 1),
    };
}

export function printUsageLimit(usage: string, limit: string) {
    const {lastSpaceIndex, suffix} = lastWord(usage);
    const {suffix: limitSuffix} = lastWord(limit);
    if (!limitSuffix || !suffix || limitSuffix !== suffix) {
        return `${usage} / ${limit}`;
    }

    const usageNoSuffix = usage.substring(0, lastSpaceIndex);
    return `${usageNoSuffix} / ${limit}`;
}
