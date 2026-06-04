import {initialFiltersState} from '../../../../store/reducers/components/nodes/setup/setup';
import {createSelector} from 'reselect';
import transform_ from 'lodash/transform';
import {selectTemplates} from '../../../../store/selectors/settings';
import i18n from './i18n';

const getDefaultPreset = () => ({
    get name() {
        return i18n('value_all');
    },
    data: initialFiltersState,
    isDefault: true,
});

const selectSavedPresets = createSelector(selectTemplates, (presets = {}) =>
    transform_(presets, (res, data, name) => res.push({name, data, isDefault: false}), []),
);

export const selectPresets = createSelector(
    [getDefaultPreset, selectSavedPresets],
    (defaultPreset, savedPresets) => [defaultPreset, ...savedPresets],
);
