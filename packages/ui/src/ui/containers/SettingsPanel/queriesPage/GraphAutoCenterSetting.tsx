import React, {type FC} from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {selectSettingsQueryTrackerNewGraphType} from '../../../store/selectors/settings/settings-ts';
import {CheckboxSettingItem} from '../../SettingsMenu/CheckboxSettingItem';
import i18n from './i18n';

export const GraphAutoCenterSetting: FC = () => {
    const useNewGraphView = useSelector(selectSettingsQueryTrackerNewGraphType);

    if (!useNewGraphView) {
        return null;
    }

    return (
        <CheckboxSettingItem
            settingKey="global::queryTracker::graphAutoCenter"
            description={i18n('context_graph-auto-center-description')}
            oneLine
        />
    );
};
