import React, {useMemo} from 'react';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectAllUserNames, selectCurrentUserName} from '../../../../../store/selectors/global';
import {useAllUserNamesFiltered} from '../../../../../hooks/global';
import {Select, type SelectOption} from '@gravity-ui/uikit';
import {QueriesListAuthorFilter} from '../../../../../types/query-tracker/queryList';

import i18n from '../QueryFastUserFilter/i18n';

type Props = {value?: string; onChange: (value: string) => void};

export function QueryUserFilterField({value: user, onChange}: Props) {
    useAllUserNamesFiltered();
    const userNames = useSelector(selectAllUserNames);
    const login = useSelector(selectCurrentUserName);

    const values = useMemo<SelectOption[]>(() => {
        return [
            {
                value: QueriesListAuthorFilter.All,
                content: i18n('value_all'),
            },
            ...userNames.map((userName) => ({
                value: userName,
                content: userName,
            })),
        ];
    }, [userNames]);

    const value = useMemo(() => {
        let result = user;
        if (!result || result === '__all') {
            result = QueriesListAuthorFilter.All;
        }
        if (result === QueriesListAuthorFilter.My) {
            result = login;
        }
        return [result];
    }, [login, user]);

    return (
        <Select options={values} value={value} onUpdate={([next]) => onChange(next)} filterable />
    );
}
