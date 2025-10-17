import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import isEqual_ from 'lodash/isEqual';

import {KeysByType} from '../../../@types/types';
import {DescribedSettings} from '../../../shared/constants/settings-types';

import {getSettingsData} from '../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../store/actions/settings';
import {RootState} from '../../store/reducers';

const DOUBLE_CLICK_TIMEOUT = 500;

type ColumnSizes = Record<string, number>;

export function useSettingsColumnSizes<
    K extends KeysByType<DescribedSettings, Record<string, number>>,
>(key: K, {minWidth = 50, maxWidth = 800}: {minWidth?: number; maxWidth?: number} = {}) {
    const dispatch = useDispatch();
    const columnSizes = useSelector(getSettingsData)[key] ?? {};

    type UpdateFn = ColumnSizes | ((oldState: ColumnSizes) => ColumnSizes);

    const lastRef = React.useRef<{changes?: ColumnSizes; time: number}>({time: 0});

    return {
        columnSizes,
        setColumnSizes: (updateFn: UpdateFn) => {
            dispatch((_dispatch: unknown, getState: () => RootState) => {
                const prevColumnSizes = getSettingsData(getState())[key] ?? {};
                const changes = 'function' === typeof updateFn ? updateFn({}) : updateFn;
                const newValue = {
                    ...prevColumnSizes,
                    ...changes,
                };

                const time = Date.now();
                if (
                    time - lastRef.current.time < DOUBLE_CLICK_TIMEOUT &&
                    isEqual_(lastRef.current.changes, changes)
                ) {
                    Object.keys(changes).forEach((k) => {
                        delete newValue[k];
                    });
                }

                Object.assign(lastRef.current, {time, changes});

                if (!isEqual_(prevColumnSizes, newValue)) {
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
                }
            });
        },
    };
}
