import {createSelector} from 'reselect';
import map_ from 'lodash/map';
import isEmpty_ from 'lodash/isEmpty';
import every_ from 'lodash/every';

// @ts-ignore
import hammer from '@ytsaurus/interface-helpers/lib/hammer';

import {RootState} from '../../../store/reducers';

export const _LOCAL_ARCADIA_VERSION = '(development)';

function versionToArray(version: string, build?: string) {
    const VERSION_DELIMITER = '.';
    const VERSION_CHUNK_COUNT = 3;
    const VERSION_CHUNK_PLACEHOLDER = 0;

    const versionArray: Array<string | number> = map_(
        version.split(VERSION_DELIMITER),
        (subversion) => {
            return parseInt(subversion, 10);
        },
    );

    while (versionArray.length < VERSION_CHUNK_COUNT) {
        versionArray.push(VERSION_CHUNK_PLACEHOLDER);
    }

    if (build) {
        versionArray.push(build);
    }

    return versionArray;
}

/**
 * Returns true if versionA >= versionB and comparator === 'greater'
 * Returns true if versionA < versionB and comparator === 'smaller'
 * @param {String} comparator - 'greater', 'smaller'
 * @param {String} versionA
 * @param {String} versionB
 * @returns {boolean}
 */
export function _compareVersions(
    comparator: 'greater' | 'smaller',
    versionA: string,
    versionB: string,
) {
    if (versionA === versionB) {
        return comparator === 'greater';
    }

    return comparator === 'greater'
        ? hammer.utils.compareVectors(versionToArray(versionA), versionToArray(versionB)) >= 0
        : hammer.utils.compareVectors(versionToArray(versionA), versionToArray(versionB)) < 0;
}

/**
 * Determines wheter a given version belongs to a versionInterval [a, b)
 * Left end included, right end excluded (intuitive limitations - features are supported starting from a specific build)
 * @param {String} version
 * @param {String|Object} versionInterval
 * @returns {boolean}
 */
export function _versionInInterval(
    version: string,
    versionInterval: MajorMinorPatch | MajorMinorPatchRange | typeof _LOCAL_ARCADIA_VERSION,
) {
    let supported;

    if (typeof versionInterval === 'object') {
        supported = Object.keys(versionInterval).every((comparator) => {
            if (!(comparator === 'greater' || comparator === 'smaller')) {
                throw new Error(
                    'thor.support: feature description has unknown comparator "' +
                        comparator +
                        '",' +
                        ' cannot check support.',
                );
            }
            const key = comparator as keyof typeof versionInterval;
            return _compareVersions(comparator, version, versionInterval[key]!);
        });
    } else {
        supported = _compareVersions('greater', version, versionInterval);
    }

    return supported;
}

function getVersionAndBuild(version?: string): [string, string | undefined] | undefined {
    const parsedVersion = version?.match(/(\d+)\.(\d+)\.(\d+)/);
    let parsedBuild;

    if (parsedVersion) {
        const majorMinorPatch = parsedVersion[0];
        parsedBuild = version?.substring(parsedVersion.length);

        return [majorMinorPatch, parsedBuild];
    }
    return undefined;
}

const getRawProxyVersion = (state: RootState) => state.global.version;
const getRawSchedulerVersion = (state: RootState) => state.global.schedulerVersion;
const getRawMasterVersion = (state: RootState) => state.global.masterVersion;

type MajorMinorPatch = `${number}.${number}.${number}`;
type MajorMinorPatchRange = {greater?: MajorMinorPatch; smaller?: MajorMinorPatch};

export type RawVersion = `${MajorMinorPatch}-${string}`;

export type Versions<T> = {proxy?: T | typeof _LOCAL_ARCADIA_VERSION; scheduler?: T; master?: T};

type FeatureVersions = Versions<MajorMinorPatch | Array<MajorMinorPatchRange>>;
type RawFeatureVersions = Versions<RawVersion>;

const FEATURES = {
    fieldsFilter: {
        scheduler: '22.1.9091155',
    } as FeatureVersions,
    effectiveExpiration: {
        master: '23.1.11146445',
    } as FeatureVersions,
    clusterNodeVersion: {
        proxy: '23.2.0',
    } as FeatureVersions,
    nodeMaintenanceApi: {
        proxy: '23.1.11106567',
    } as FeatureVersions,
    schedulingChildrenByPool: {
        scheduler: '23.1.11146742',
    } as FeatureVersions,
};

export function _isFeatureSupported<T extends Record<string, FeatureVersions>>(
    rawVersions: RawFeatureVersions,
    features: T,
) {
    return (featureName: keyof T) => {
        function failFeature(message: string) {
            console.warn(`thor.support "${featureName as string}" ${message}`);
            return false;
        }

        const featureVersions: FeatureVersions = features[featureName];

        if (!featureVersions) {
            return failFeature(`${featureName as string} is unknown, cannot check support.`);
        }

        if (isEmpty_(featureVersions)) {
            return failFeature('feature component version is unknown, cannot check support.');
        }

        return every_(featureVersions, (value, k) => {
            const key = k as keyof typeof rawVersions;
            const rawVersion = rawVersions[key];

            // yt-local in arcadia is meant to be of the freshest version
            if (rawVersion === _LOCAL_ARCADIA_VERSION) {
                return true;
            }

            if (!value) {
                return failFeature(`feature version of '${key}' is unknown, connot check support`);
            }

            const buildVersion = getVersionAndBuild(rawVersion);
            if (!buildVersion) {
                return failFeature(
                    `version of '${key}' component is unknown, cannot check support.`,
                );
            }

            if (Array.isArray(value)) {
                return value.some((item) => _versionInInterval(buildVersion[0], item));
            } else {
                return _versionInInterval(buildVersion[0], value);
            }
        });
    };
}

export const isSupportedSelector = createSelector(
    [getRawProxyVersion, getRawSchedulerVersion, getRawMasterVersion],
    (proxy, scheduler, master) => _isFeatureSupported({proxy, scheduler, master}, FEATURES),
);

export const isSupportedEffectiveExpiration = createSelector(
    [isSupportedSelector],
    (isSupported) => {
        return isSupported('effectiveExpiration');
    },
);

export const isSupportedClusterNodeForVersions = createSelector(
    [isSupportedSelector],
    (isSupported) => {
        return isSupported('clusterNodeVersion');
    },
);

export const isSupportedNodeMaintenanceApi = createSelector(
    [isSupportedSelector],
    (isSupported) => {
        return isSupported('nodeMaintenanceApi');
    },
);

export const isSupportedSchedulingChildrenByPool = createSelector(
    [isSupportedSelector],
    (isSupported) => {
        return isSupported('schedulingChildrenByPool');
    },
);
