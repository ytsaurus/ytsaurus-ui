import React, {FC, useMemo} from 'react';
import {
    QueriesListAuthorFilter,
    QueriesListFilter,
} from '../../../../types/query-tracker/queryList';
import {ControlGroupOption, RadioButton} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {getQueriesFilters} from '../../../../store/selectors/query-tracker/queriesList';
import {applyFilter} from '../../../../store/actions/query-tracker/queriesList';
import {getCurrentUserName} from '../../../../store/selectors/global';

const AuthorFilter: ControlGroupOption[] = [
    {
        value: QueriesListAuthorFilter.My,
        content: 'My',
    },
    {
        value: QueriesListAuthorFilter.All,
        content: 'All',
    },
];

export const QueryFastUserFilter: FC = () => {
    const dispatch = useDispatch();
    const {user} = useSelector(getQueriesFilters);
    const login = useSelector(getCurrentUserName);

    const handleUserChange = (value: string) => {
        dispatch(applyFilter({user: value as QueriesListFilter['user']}));
    };

    const value = useMemo(() => {
        if (QueriesListAuthorFilter.My === user || user === login)
            return QueriesListAuthorFilter.My;

        return QueriesListAuthorFilter.All;
    }, [login, user]);

    return <RadioButton options={AuthorFilter} value={value} onUpdate={handleUserChange} />;
};
