import {initialFiltersState} from '../../../../store/reducers/components/nodes/setup/setup';
import {createSelector} from 'reselect';
import transform_ from 'lodash/transform';
import {getTemplates} from '../../../../store/selectors/settings';

const getDefaultPreset = () => ({
    name: 'All',
    data: initialFiltersState,
    isDefault: true,
});

const getSavedPresets = createSelector(getTemplates, (presets = {}) =>
    transform_(presets, (res, data, name) => res.push({name, data, isDefault: false}), []),
);

export const getPresets = createSelector(
    [getDefaultPreset, getSavedPresets],
    (defaultPreset, savedPresets) => [defaultPreset, ...savedPresets],
);
