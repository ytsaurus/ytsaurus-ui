import React, {FC, useMemo} from 'react';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {getQueriesFilters} from '../../../../../store/selectors/query-tracker/queriesList';
import {DatePicker} from '@gravity-ui/date-components';
import {DateTime, dateTimeParse} from '../../../../../utils/date-utils';
import {Flex} from '@gravity-ui/uikit';
import {applyFilter} from '../../../../../store/actions/query-tracker/queriesList';
import i18n from './i18n';

export const QueryDateFilter: FC = () => {
    const dispatch = useDispatch();
    const {from, to} = useSelector(getQueriesFilters);

    const setFilter = useMemo(
        () => ({
            from: (value?: DateTime | null) => {
                dispatch(applyFilter({from: value ? value.valueOf() : undefined}));
            },
            to: (value?: DateTime | null) => {
                dispatch(applyFilter({to: value ? value.endOf('day').valueOf() : undefined}));
            },
        }),
        [dispatch],
    );

    return (
        <Flex alignItems="center" gap={1}>
            <DatePicker
                placeholder={i18n('context_start-date')}
                format="DD.MM.YYYY"
                value={from ? dateTimeParse(from) : null}
                onUpdate={setFilter.from}
                hasClear
            />{' '}
            &mdash;
            <DatePicker
                placeholder={i18n('context_end-date')}
                format="DD.MM.YYYY"
                value={to ? dateTimeParse(to)?.startOf('day') : null}
                onUpdate={setFilter.to}
                hasClear
            />
        </Flex>
    );
};
