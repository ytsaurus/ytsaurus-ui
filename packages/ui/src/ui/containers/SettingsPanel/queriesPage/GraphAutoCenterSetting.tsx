import React, {FC} from 'react';
import {useSelector} from '../../../store/redux-hooks';
import {getSettingsQueryTrackerNewGraphType} from '../../../store/selectors/settings/settings-ts';
import {BooleanSettingItem} from '../../SettingsMenu/BooleanSettingItem';
import i18n from './i18n';

export const GraphAutoCenterSetting: FC = () => {
    const useNewGraphView = useSelector(getSettingsQueryTrackerNewGraphType);

    if (!useNewGraphView) {
        return null;
    }

    return (
        <BooleanSettingItem
            settingKey="global::queryTracker::graphAutoCenter"
            description={i18n('context_graph-auto-center-description')}
            oneLine
        />
    );
};
