import {SelectOptionGroup} from '@gravity-ui/uikit/build/esm/components/Select/types';
import {RootState} from '../../../../store/reducers';
import {getSettingsData} from '../../../../store/selectors/settings-base';
const getState = (state: RootState) => state.queryTracker.acoList;

export const getLastSelectedACONamespaces = (state: RootState) =>
    getSettingsData(state)['global::queryTracker::lastSelectedACOs'] ?? [];

export const getQueryACOOptions = (state: RootState): SelectOptionGroup[] => {
    return [
        {
            label: 'Recently used',
            options: getLastSelectedACONamespaces(state).map((text) => ({
                content: text,
                value: text,
            })),
        },
        {
            label: 'ACOs',
            options: getState(state).list.map((text) => ({content: text, value: text})),
        },
    ];
};
