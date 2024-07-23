import {createSelector} from 'reselect';
import filter_ from 'lodash/filter';
import reduce_ from 'lodash/reduce';
import every_ from 'lodash/every';
import isEqual_ from 'lodash/isEqual';

import {RootState} from '../../../store/reducers';
import {calculateLoadingStatus, isFinalLoadingStatus} from '../../../utils/utils';
import {getSettingsDataRaw} from '../settings-ts';
import {NAMESPACES} from '../../../../shared/constants/settings';
import {NS_SEPARATOR} from '../../../../shared/utils/settings';
import {
    OPERATIONS_LIST_DEFAULT_FILTERS,
    OPERATIONS_LIST_RUNNING_PRESET,
} from '../../../constants/operations/list';
import {getCurrentUserName} from '../global';
import {getOperationsListFilters} from '.';

export const getOperationsListIsFinalState = createSelector(
    [
        (state: RootState) => state.operations.list.isLoading,
        (state: RootState) => state.operations.list.hasLoaded,
        (state: RootState) => state.operations.list.hasError,
    ],
    (loading, loaded, error) => {
        const status = calculateLoadingStatus(loading, loaded, error);
        return isFinalLoadingStatus(status);
    },
);

interface PresetItem {
    name: string;
    filters: Record<string, any>;
}

/**
 * 
 * 
  

    

 * 
 * @param login 
 * @returns 
 */

function createPreconfiguredPresets(login: string) {
    return {
        [OPERATIONS_LIST_RUNNING_PRESET]: {
            name: 'My/Running',
            preconfigured: true,
            filters: {
                ...OPERATIONS_LIST_DEFAULT_FILTERS,
                user: login,
                state: 'running',
            },
        },
        ['failed']: {
            name: 'My/Failed',
            preconfigured: true,
            filters: {
                ...OPERATIONS_LIST_DEFAULT_FILTERS,
                user: login,
                state: 'failed',
            },
        },
    };
}

export const getOperationsListFilterPresets = createSelector(
    [getSettingsDataRaw, getCurrentUserName],
    (data, login) => {
        const collectionKeys = filter_(Object.keys(data), (path) =>
            path.startsWith(NAMESPACES.OPERATION_PRESETS.value),
        );
        return {
            ...createPreconfiguredPresets(login),
            ...reduce_(
                collectionKeys,
                (collection, path) => {
                    const settingName = path.slice(
                        (NAMESPACES.OPERATION_PRESETS.value + NS_SEPARATOR).length,
                    );
                    collection[settingName] = {...(data as Record<string, PresetItem>)[path]};
                    return collection;
                },
                {} as Record<string, PresetItem>,
            ),
        };
    },
);

export const getOperationsListActivePresets = createSelector(
    [getOperationsListFilters, getOperationsListFilterPresets],
    (selectedFilters, presets) => {
        return reduce_(
            presets,
            (acc, {filters}, presetId) => {
                const active = every_(filters, (value, k) => {
                    const key: keyof typeof selectedFilters = k as any;
                    return isEqual_(selectedFilters[key]?.value, value);
                });
                if (active) {
                    acc.add(presetId);
                }
                return acc;
            },
            new Set<string>(),
        );
    },
);
