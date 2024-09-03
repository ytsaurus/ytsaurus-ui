import React, {FC, useEffect, useMemo} from 'react';
import {Item, SelectSingle} from '../../../../components/Select/Select';
import {useDispatch, useSelector} from 'react-redux';
import cn from 'bem-cn-lite';
import {getDefaultQueryACO, selectAvailableAco} from '../../module/query_aco/selectors';
import {getQueryACO, setUserDefaultACO} from '../../module/query_aco/actions';

import './QueryACOSettingsMenuForm.scss';

const block = cn('query-aco-settings-menu-form');

export const QueryACOSettingsMenuForm: FC = () => {
    const dispatch = useDispatch();
    const defaultUserACO = useSelector(getDefaultQueryACO);
    const ACOList = useSelector(selectAvailableAco);

    useEffect(() => {
        dispatch(getQueryACO());
    }, [dispatch]);

    const items = useMemo(() => {
        return ACOList.reduce<Item[]>((acc, item) => {
            acc.push({value: item, text: item});
            return acc;
        }, []);
    }, [ACOList]);

    const handleACOChange = (value?: string) => {
        if (value) {
            dispatch(setUserDefaultACO(value));
        }
    };

    return (
        <div className={block()}>
            <SelectSingle
                value={defaultUserACO}
                items={items}
                onChange={handleACOChange}
                placeholder="ACO"
            />
        </div>
    );
};
