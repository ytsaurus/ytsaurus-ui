import {createSelector} from 'reselect';
import filter_ from 'lodash/filter';
import reduce_ from 'lodash/reduce';
import every_ from 'lodash/every';
import isEqual_ from 'lodash/isEqual';

import {RootState} from '../../../store/reducers';
import {calculateLoadingStatus, isFinalLoadingStatus} from '../../../utils/utils';
import {getSettingsDataRaw} from '../../../store/selectors/settings/settings-ts';
import {NAMESPACES} from '../../../../shared/constants/settings';
import {NS_SEPARATOR} from '../../../../shared/utils/settings';
import {
    OPERATIONS_LIST_DEFAULT_FILTERS,
    OPERATIONS_LIST_RUNNING_PRESET,
} from '../../../constants/operations/list';
import {getCurrentUserName} from '../global';
import {getOperationsListFilters} from '.';
import {
    OperationPresetsSettings,
    OperationsListPreset,
} from '../../../../shared/constants/settings-types';

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
    (data, login): Record<string, OperationsListPreset> => {
        const collectionKeys: Array<keyof OperationPresetsSettings> = filter_(
            Object.keys(data) as Array<keyof OperationPresetsSettings>,
            (path) => path.startsWith(NAMESPACES.OPERATION_PRESETS.value),
        );
        return {
            ...createPreconfiguredPresets(login),
            ...reduce_(
                collectionKeys,
                (collection, path) => {
                    const settingName = path.slice(
                        (NAMESPACES.OPERATION_PRESETS.value + NS_SEPARATOR).length,
                    );
                    collection[settingName] = {...data[path]};
                    return collection;
                },
                {} as Record<string, OperationPresetsSettings>,
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
