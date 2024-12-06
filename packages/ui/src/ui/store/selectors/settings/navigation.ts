import {createSelector} from 'reselect';

import UIFactory from '../../../UIFactory';
import {isDeveloper} from '../../../store/selectors/global/is-developer';
import {getSettingsData} from './settings-base';

export const getNavigationSqlService = createSelector(
    [getSettingsData, isDeveloper],
    (data, isAdmin) => {
        const value = data['global::navigation::sqlService'];
        const isQtKitEnabled = value?.length ? -1 !== value.indexOf('qtkit') : isAdmin;
        const isYqlKitEnabled = value?.length ? -1 !== value.indexOf('yqlkit') : true;

        const hasYqlWidget = Boolean(UIFactory.yqlWidgetSetup);
        return {
            value,
            isQtKitEnabled: !hasYqlWidget || isQtKitEnabled,
            isYqlKitEnabled: hasYqlWidget && isYqlKitEnabled,
            hasYqlWidget,
        };
    },
);
