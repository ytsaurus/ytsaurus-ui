import React, {FC} from 'react';
import {
    getQueryTrackerInfo,
    setUserDefaultACO,
} from '../../../store/actions/query-tracker/queryAco';
import {Item} from '../../../components/Select/Select';
import {SettingsMenuSelect} from '../../SettingsMenu/SettingsMenuSelect';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {getDefaultQueryACO} from '../../../store/selectors/query-tracker/queryAco';

export const DefaultAcoSelect: FC = () => {
    const dispatch = useDispatch();
    const defaultUserACO = useSelector(getDefaultQueryACO);

    return (
        <SettingsMenuSelect
            getOptionsOnMount={() =>
                dispatch(getQueryTrackerInfo()).then((data) => {
                    return data.access_control_objects.reduce((acc: Item[], item: string) => {
                        acc.push({value: item, text: item});
                        return acc;
                    }, [] as Item[]);
                })
            }
            setSetting={(value) => value && dispatch(setUserDefaultACO(value))}
            getSetting={() => defaultUserACO}
        />
    );
};
