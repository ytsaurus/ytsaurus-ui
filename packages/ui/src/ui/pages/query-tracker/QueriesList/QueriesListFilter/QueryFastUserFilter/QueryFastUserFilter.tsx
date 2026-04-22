import React, {type FC, useMemo} from 'react';
import {
    QueriesListAuthorFilter,
    type QueriesListFilter,
} from '../../../../../types/query-tracker/queryList';
import {type ControlGroupOption, SegmentedRadioGroup} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectQueriesFilters} from '../../../../../store/selectors/query-tracker/queriesList';
import {applyFilter} from '../../../../../store/actions/query-tracker/queriesList';
import {selectCurrentUserName} from '../../../../../store/selectors/global';
import i18n from './i18n';

const getAuthorFilter = (): ControlGroupOption[] => [
    {
        value: QueriesListAuthorFilter.My,
        content: i18n('value_my'),
    },
    {
        value: QueriesListAuthorFilter.All,
        content: i18n('value_all'),
    },
];

export const QueryFastUserFilter: FC = () => {
    const dispatch = useDispatch();
    const {user} = useSelector(selectQueriesFilters);
    const login = useSelector(selectCurrentUserName);

    const handleUserChange = (value: string) => {
        dispatch(applyFilter({user: value as QueriesListFilter['user']}));
    };

    const value = useMemo(() => {
        if (QueriesListAuthorFilter.My === user || user === login)
            return QueriesListAuthorFilter.My;

        return QueriesListAuthorFilter.All;
    }, [login, user]);

    return (
        <SegmentedRadioGroup
            options={getAuthorFilter()}
            value={value}
            onUpdate={handleUserChange}
        />
    );
};
