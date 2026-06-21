import {Gear, GearDot} from '@gravity-ui/icons';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import React from 'react';
import Dropdown from '../../../../../../components/Dropdown/Dropdown';
import {useDispatch, useSelector} from '../../../../../../store/redux-hooks';
import {selectSettingsData} from '../../../../../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../../../../../store/actions/settings';
import i18n from './i18n';

export function MapNodeUserSettings() {
    const dispatch = useDispatch();
    const {['global::navigation::groupNodes']: groupped} = useSelector(selectSettingsData);

    return (
        <Dropdown
            trigger="click"
            button={
                <Button size="m" title={i18n('title_settings')} view="outlined">
                    <Icon data={groupped ? GearDot : Gear} />
                </Button>
            }
            template={
                <div>
                    <Checkbox
                        checked={groupped}
                        onUpdate={(v) => {
                            dispatch(setSettingByKey('global::navigation::groupNodes', v));
                        }}
                    >
                        {i18n('action_group-nodes-by-type')}
                    </Checkbox>
                </div>
            }
        />
    );
}
