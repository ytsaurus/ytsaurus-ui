import {useDispatch, useSelector} from 'react-redux';
import isEqual_ from 'lodash/isEqual';

import {KeysByType} from '../../../@types/types';
import {DescribedSettings} from '../../../shared/constants/settings-types';

import {getSettingsData} from '../../store/selectors/settings/settings-base';
import {setSettingByKey} from '../../store/actions/settings';
import {RootState} from '../../store/reducers';

type ColumnVisibility = Record<string, boolean>;

type ColumnOrder = Array<string>;

export function useSettingsVisibleColumns<K extends KeysByType<DescribedSettings, Array<string>>>(
    key: K,
) {
    const dispatch = useDispatch();
    const visibleColumns = useSelector(getSettingsData)[key] ?? [];

    return {
        visibleColumns,
        onColumnVisibilityChange: (
            updateFn: ColumnVisibility | ((oldState: ColumnVisibility) => ColumnVisibility),
        ) => {
            dispatch((_dispatch: unknown, getState: () => RootState) => {
                const prevVisibleColumns = getSettingsData(getState())[key] ?? [];
                const newVisibility = 'function' === typeof updateFn ? updateFn({}) : updateFn;

                const newVisibleColumns: DescribedSettings[K] = [
                    ...prevVisibleColumns,
                ] as typeof prevVisibleColumns;
                Object.keys(newVisibility).forEach((k) => {
                    const kIndex = newVisibleColumns.indexOf(k as any);
                    const visible = newVisibility[k];
                    if (visible) {
                        if (-1 === kIndex) {
                            newVisibleColumns.push(k as any);
                        }
                    } else {
                        if (-1 !== kIndex) {
                            newVisibleColumns.splice(kIndex, 1);
                        }
                    }
                });

                if (!isEqual_(prevVisibleColumns, newVisibleColumns)) {
                    dispatch(setSettingByKey(key, newVisibleColumns));
                }
            });
        },
        onColumnOrderChange: (
            updateFn: ColumnOrder | ((prevOrder: ColumnOrder) => ColumnOrder),
        ) => {
            dispatch((_dispatch: unknown, getState: () => RootState) => {
                const prevVisibleColumns = getSettingsData(getState())[key] ?? [];
                const visible = new Set<string>(prevVisibleColumns);

                const newOrder = 'function' === typeof updateFn ? updateFn([]) : updateFn;

                const newValue = newOrder.filter((item) => {
                    return visible.has(item);
                }) as typeof prevVisibleColumns;

                if (!isEqual_(prevVisibleColumns, newValue)) {
                    dispatch(setSettingByKey(key, newValue));
                }
            });
        },
    };
}
