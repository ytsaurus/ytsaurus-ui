import React, {FC, useCallback, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAllUserNames, getCurrentUserName} from '../../../../store/selectors/global';
import {useAllUserNamesFiltered} from '../../../../hooks/global';
import {Select, SelectOption} from '@gravity-ui/uikit';
import {getQueriesFilters} from '../../module/queries_list/selectors';
import {QueriesListAuthorFilter} from '../../module/queries_list/types';
import {applyFilter} from '../../module/queries_list/actions';

const ALL_STATUS_KEY = '__all';

export const QueryUserFilter: FC = () => {
    useAllUserNamesFiltered();
    const dispatch = useDispatch();
    const userNames = useSelector(getAllUserNames);
    const login = useSelector(getCurrentUserName);
    const {user} = useSelector(getQueriesFilters);

    const values = useMemo<SelectOption[]>(() => {
        return [
            {
                value: ALL_STATUS_KEY,
                content: 'All',
            },
            ...userNames.map((userName) => ({
                value: userName,
                content: userName,
            })),
        ];
    }, [userNames]);

    const value = useMemo(() => {
        let result = user;
        if (!result) {
            result = ALL_STATUS_KEY;
        }
        if (result === QueriesListAuthorFilter.My) {
            result = login;
        }
        return [result];
    }, [login, user]);

    const handleOnChange = useCallback(
        (items: string[]) => {
            dispatch(applyFilter({user: items[0]}));
        },
        [dispatch],
    );

    return <Select options={values} value={value} onUpdate={handleOnChange} filterable />;
};
