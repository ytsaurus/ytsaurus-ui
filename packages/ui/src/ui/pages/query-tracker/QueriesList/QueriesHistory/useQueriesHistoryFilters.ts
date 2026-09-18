import React from 'react';
import {type QueryListFilterConfig} from '@gravity-ui/querieskit';

import hammer from '../../../../common/hammer';
import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import {Engines} from '../../../../types/query-tracker/api';
import {
    QueriesListAuthorFilter,
    type QueriesListFilter,
} from '../../../../types/query-tracker/queryList';
import {QueryStatus} from '../../../../types/query-tracker';
import {dateTimeParse} from '../../../../utils/date-utils';
import {QueryEnginesNames} from '../../../../../shared/constants/engines';
import i18n from '../i18n';

const ALL_VALUE = '__all';

type FilterValues = {
    onlyMine?: boolean;
    range?: {
        start?: {valueOf(): number} | null;
        end?: {valueOf(): number; endOf(unit: 'day'): {valueOf(): number}} | null;
    };
    engine?: string[];
    state?: string[];
};

export function useQueriesHistoryFilters(filter: QueriesListFilter) {
    const dispatch = useDispatch();
    const [formKey, setFormKey] = React.useState(0);

    const initialValues = React.useMemo<FilterValues>(
        () => ({
            onlyMine: filter.user === QueriesListAuthorFilter.My,
            range: {
                start: filter.from ? dateTimeParse(filter.from) : null,
                end: filter.to ? dateTimeParse(filter.to)?.startOf('day') : null,
            },
            engine: [filter.engine ?? ALL_VALUE],
            state: [filter.state ?? ALL_VALUE],
        }),
        [filter.engine, filter.from, filter.state, filter.to, filter.user],
    );

    const fields = React.useMemo(
        () => [
            {id: 'onlyMine', type: 'switch', title: i18n('filter_only-mine')},
            {id: 'range', type: 'rangeDatePicker', title: i18n('filter_period')},
            {
                id: 'engine',
                type: 'select',
                title: i18n('filter_engine'),
                options: [
                    {value: ALL_VALUE, content: i18n('value_all')},
                    ...Engines.map((engine) => ({
                        value: engine,
                        content: QueryEnginesNames[engine],
                    })),
                ],
            },
            {
                id: 'state',
                type: 'select',
                title: i18n('filter_state'),
                options: [
                    {value: ALL_VALUE, content: i18n('value_all')},
                    ...Object.values(QueryStatus).map((state) => ({
                        value: state,
                        content: hammer.format.Readable(state),
                    })),
                ],
            },
        ],
        [],
    );

    const handleApply = React.useCallback(
        (values: Record<string, unknown>) => {
            const {onlyMine, range, engine, state} = values as FilterValues;
            const selectedEngine = engine?.[0];
            const selectedState = state?.[0];

            dispatch(
                applyFilter({
                    user: onlyMine ? QueriesListAuthorFilter.My : QueriesListAuthorFilter.All,
                    from: range?.start?.valueOf(),
                    to: range?.end?.endOf('day').valueOf(),
                    engine:
                        selectedEngine && selectedEngine !== ALL_VALUE
                            ? (selectedEngine as QueriesListFilter['engine'])
                            : undefined,
                    state:
                        selectedState && selectedState !== ALL_VALUE
                            ? (selectedState as QueryStatus)
                            : undefined,
                }),
            );
        },
        [dispatch],
    );

    const handleReset = React.useCallback(() => {
        dispatch(resetFilter());
        setFormKey((key) => key + 1);
    }, [dispatch]);

    const isChanged = Boolean(
        filter.from ||
        filter.to ||
        filter.state ||
        filter.engine ||
        filter.user !== QueriesListAuthorFilter.My,
    );

    const config = React.useMemo<QueryListFilterConfig>(
        () => ({
            fields: fields as unknown as QueryListFilterConfig['fields'],
            initialValues,
            isChanged,
            onApply: handleApply,
            onReset: handleReset,
        }),
        [fields, handleApply, handleReset, initialValues, isChanged],
    );

    return {config, formKey};
}
