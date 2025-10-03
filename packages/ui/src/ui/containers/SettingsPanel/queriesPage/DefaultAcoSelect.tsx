import React, {FC} from 'react';
import {getQueryACO, setUserDefaultACO} from '../../../store/actions/queries/queryAco';
import {Item} from '../../../components/Select/Select';
import {SettingsMenuSelect} from '../../SettingsMenu/SettingsMenuSelect';
import {useThunkDispatch} from '../../../store/thunkDispatch';
import {useSelector} from 'react-redux';
import {getDefaultQueryACO} from '../../../store/selectors/queries/queryAco';

export const DefaultAcoSelect: FC = () => {
    const dispatch = useThunkDispatch();
    const defaultUserACO = useSelector(getDefaultQueryACO);

    return (
        <SettingsMenuSelect
            getOptionsOnMount={() =>
                dispatch(getQueryACO()).then((data) => {
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
