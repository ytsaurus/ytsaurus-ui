import React, {FC, useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {getQueriesFilters} from '../../../../store/selectors/query-tracker/queriesList';
import {DatePicker} from '@gravity-ui/date-components';
import {DateTime, dateTime} from '@gravity-ui/date-utils';
import {Flex} from '@gravity-ui/uikit';
import {applyFilter} from '../../../../store/actions/query-tracker/queriesList';

export const QueryDateFilter: FC = () => {
    const dispatch = useDispatch();
    const {from, to} = useSelector(getQueriesFilters);

    const setFilter = useMemo(
        () => ({
            from: (value?: DateTime | null) => {
                dispatch(applyFilter({from: value ? value.valueOf() : undefined}));
            },
            to: (value?: DateTime | null) => {
                dispatch(applyFilter({to: value ? value.valueOf() : undefined}));
            },
        }),
        [dispatch],
    );

    return (
        <Flex alignItems="center" gap={1}>
            <DatePicker
                placeholder="Start date"
                format="DD.MM.YYYY"
                value={from ? dateTime({input: from}) : null}
                onUpdate={setFilter.from}
                hasClear
            />{' '}
            &mdash;
            <DatePicker
                placeholder="End date"
                format="DD.MM.YYYY"
                value={to ? dateTime({input: to}) : null}
                onUpdate={setFilter.to}
                hasClear
            />
        </Flex>
    );
};
