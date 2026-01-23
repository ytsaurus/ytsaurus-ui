import {Gear, GearDot} from '@gravity-ui/icons';
import {Button, Checkbox, Icon} from '@gravity-ui/uikit';
import React from 'react';
import Dropdown from '../../../../components/Dropdown/Dropdown';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getSettingsData} from '../../../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../../../store/actions/settings';

export function MapNodeUserSettings() {
    const dispatch = useDispatch();
    const {['global::navigation::groupNodes']: groupped} = useSelector(getSettingsData);

    return (
        <Dropdown
            trigger="click"
            button={
                <Button size="m" title="settings" view="outlined">
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
                        Group nodes by type
                    </Checkbox>
                </div>
            }
        />
    );
}
