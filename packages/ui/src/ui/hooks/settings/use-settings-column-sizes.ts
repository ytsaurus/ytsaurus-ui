import {useDispatch, useSelector} from 'react-redux';

import {KeysByType} from '../../../@types/types';
import {DescribedSettings} from '../../../shared/constants/settings-types';

import {getSettingsData} from '../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../store/actions/settings';
import {RootState} from '../../store/reducers';

export function useSettingsColumnSizes<
    K extends KeysByType<DescribedSettings, Record<string, number>>,
>(key: K, {minWidth = 50, maxWidth = 800}: {minWidth?: number; maxWidth?: number} = {}) {
    const dispatch = useDispatch();
    const columnSizes = useSelector(getSettingsData)[key] ?? {};

    return {
        columnSizes,
        setColumnSizes: (
            updateFn: typeof columnSizes | ((oldState: typeof columnSizes) => typeof columnSizes),
        ) => {
            dispatch((_dispatch: unknown, getState: () => RootState) => {
                const prevColumnSizes = getSettingsData(getState())[key] ?? {};
                const newValue =
                    'function' === typeof updateFn ? updateFn(prevColumnSizes) : updateFn;

                dispatch(
                    setSettingByKey(
                        key,
                        Object.entries(newValue).reduce(
                            (acc, [k, value]) => {
                                acc[k] = Math.max(minWidth, Math.min(maxWidth, value));
                                return acc;
                            },
                            {} as Record<string, number>,
                        ),
                    ),
                );
            });
        },
    };
}
