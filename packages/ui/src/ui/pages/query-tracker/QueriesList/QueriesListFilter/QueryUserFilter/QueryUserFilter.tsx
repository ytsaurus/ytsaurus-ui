import React, {useMemo} from 'react';
import {Select, type SelectOption} from '@gravity-ui/uikit';
import {useSelector} from '../../../../../store/redux-hooks';
import {selectAllUserNames, selectCurrentUserName} from '../../../../../store/selectors/global';
import {useAllUserNamesFiltered} from '../../../../../hooks/global';
import {QueriesListAuthorFilter} from '../../../../../types/query-tracker/queryList';
import i18n from '../QueryFastUserFilter/i18n';

type Props = {
    value?: string;
    onUpdate: (value: string) => void;
};

export function QueryUserFilter({value, onUpdate}: Props) {
    useAllUserNamesFiltered();
    const userNames = useSelector(selectAllUserNames);
    const login = useSelector(selectCurrentUserName);
    const options = useMemo<SelectOption[]>(
        () => [
            {value: QueriesListAuthorFilter.All, content: i18n('value_all')},
            ...userNames.map((userName) => ({value: userName, content: userName})),
        ],
        [userNames],
    );
    const selectedUser =
        value === QueriesListAuthorFilter.My ? login : value || QueriesListAuthorFilter.All;

    return (
        <Select
            options={options}
            value={[selectedUser]}
            onUpdate={([user]) => onUpdate(user)}
            filterable
        />
    );
}
