import hammer from '@ytsaurus/interface-helpers/lib/hammer';
import _ from 'lodash';
import {createSelector} from 'reselect';

export const _LOCAL_ARCADIA_VERSION = '(development)';
export const _DEV_PATCH_NUMBER = '0';
const STABLE = 'stable';
const PRESTABLE = 'prestable';
const GREATER = 'greater';
const SMALLER = 'smaller';

function versionToArray(version, build) {
    const VERSION_DELIMITER = '.';
    const VERSION_CHUNK_COUNT = 3;
    const VERSION_CHUNK_PLACEHOLDER = 0;

    const versionArray = _.map(version.split(VERSION_DELIMITER), (subversion) => {
        return parseInt(subversion, 10);
    });

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
export function _compareVersions(comparator, versionA, versionB) {
    if (versionA === versionB) {
        return comparator === GREATER;
    }

    return comparator === GREATER
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
export function _versionInInterval(version, versionInterval) {
    let supported;

    if (typeof versionInterval === 'object') {
        supported = Object.keys(versionInterval).every((comparator) => {
            if (!(comparator === GREATER || comparator === SMALLER)) {
                throw new Error(
                    'thor.support: feature description has unknown comparator "' +
                        comparator +
                        '",' +
                        ' cannot check support.',
                );
            }
            return _compareVersions(comparator, version, versionInterval[comparator]);
        });
    } else {
        supported = _compareVersions(GREATER, version, versionInterval);
    }

    return supported;
}

function getVersionAndBuild(version) {
    let parsedVersion = version && version.match(/(\d+)\.(\d+)\.(\d+)/);
    let parsedBuild;

    if (parsedVersion) {
        parsedVersion = parsedVersion[0];
        parsedBuild = version.substring(parsedVersion.length);

        return [parsedVersion, parsedBuild];
    }
}

function extractPatchNumber(version) {
    const parsedVersion = version && version.match(/(\d+)\.(\d+)\.(\d+)/);
    return parsedVersion && parsedVersion[3];
}

const rawProxyVersion = (state) => state.global.version;
const rawSchedulerVersion = (state) => state.global.schedulerVersion;
const rawMasterVersion = (state) => state.global.masterVersion;
export const getProxyVersion = createSelector(rawProxyVersion, getVersionAndBuild);
const proxyPatchNumber = createSelector(rawProxyVersion, extractPatchNumber);
export const getSchedulerVersion = createSelector(rawSchedulerVersion, getVersionAndBuild);
export const getMasterVersion = createSelector(rawMasterVersion, getVersionAndBuild);

const features = createSelector(
    [getProxyVersion, getSchedulerVersion, getMasterVersion],
    (proxy, scheduler, master) => {
        return {
            fieldsFilter: {
                prestable: '22.1.9091155',
                component: scheduler,
            },
            effectiveExpiration: {
                prestable: '23.1.11146445',
                component: master,
            },
            clusterNodeVersion: {
                prestable: '23.2',
            },
            nodeMaintenanceApi: {
                prestable: '23.1.11106567',
                component: proxy,
            },
            schedulingChildrenByPool: {
                prestable: '23.1.11146742',
                component: scheduler,
            },
        };
    },
);

export const _isFeatureSupported = (rawProxyVersion, proxyPatch, features) => (featureName) => {
    // yt-local in arcadia is meant to be of the freshest version
    if (rawProxyVersion === _LOCAL_ARCADIA_VERSION || proxyPatch === _DEV_PATCH_NUMBER) {
        return true;
    }

    function failFeature(message) {
        console.warn(`thor.support "${featureName}" ${message}`);
        return false;
    }

    if (!Object.hasOwnProperty.call(features, featureName)) {
        return failFeature('feature is unknown, cannot check support.');
    }

    const feature = features[featureName];

    if (typeof feature === 'function') {
        return feature();
    } else {
        const componentVersion = feature.component;

        if (!componentVersion) {
            return failFeature('feature component version is unknown, cannot check support.');
        }

        const currentBranch = componentVersion[1].indexOf('-' + STABLE) === 0 ? STABLE : PRESTABLE;

        const featureVersionInterval = feature[currentBranch] || feature[PRESTABLE];

        if (!featureVersionInterval) {
            return failFeature(
                `feature version for branch "${currentBranch}" or branch "${PRESTABLE}" is unknown, cannot check support.`,
            );
        }

        if (Array.isArray(featureVersionInterval)) {
            return featureVersionInterval.some((interval) =>
                _versionInInterval(componentVersion[0], interval),
            );
        } else {
            return _versionInInterval(componentVersion[0], featureVersionInterval);
        }
    }
};

export const isSupportedSelector = createSelector(
    [rawProxyVersion, proxyPatchNumber, features],
    _isFeatureSupported,
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
