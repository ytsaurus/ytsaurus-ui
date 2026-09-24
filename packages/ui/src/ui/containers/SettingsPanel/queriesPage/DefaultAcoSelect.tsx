import React, {type FC} from 'react';
import {getQueryTrackerInfo} from '../../../store/actions/query-tracker/queryAco';
import {type Item} from '../../../components/Select/Select';
import {SelectSettingItem} from '../../SettingsMenu/SettingsMenuSelect';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectDefaultQueryACO} from '../../../store/selectors/query-tracker/queryAco';
import {selectEffectiveApiStage} from '../../../store/selectors/query-tracker/query';

export const DefaultAcoSelect: FC = () => {
    const dispatch = useDispatch();
    const defaultUserACO = useSelector(selectDefaultQueryACO);
    const stage = useSelector(selectEffectiveApiStage);
    const [options, setOptions] = React.useState<Array<Item<string>>>([]);

    React.useEffect(() => {
        dispatch(getQueryTrackerInfo()).then((data) => {
            setOptions(
                data.access_control_objects.map((item: string) => ({value: item, text: item})),
            );
        });
    }, [dispatch]);

    return (
        <SelectSettingItem
            settingKey={`qt-stage::${stage}::queryTracker::defaultACO`}
            options={options}
            displayValue={defaultUserACO}
        />
    );
};
