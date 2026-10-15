import React from 'react';
import {type QueryListFilterConfig} from '@gravity-ui/querieskit';

import hammer from '../../../../common/hammer';
import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import {
    QueriesListAuthorFilter,
    type QueriesListFilter,
} from '../../../../types/query-tracker/queryList';
import {QueryStatus} from '../../../../types/query-tracker';
import {dateTimeParse} from '../../../../utils/date-utils';
import i18n from '../i18n';
import {ALL_VALUE, getEngineFilterField, getSelectedEngine} from '../helpers/filters';

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

    const fields = React.useMemo<QueryListFilterConfig['fields']>(
        () => [
            {id: 'onlyMine', type: 'switch', title: i18n('filter_only-mine')},
            {id: 'range', type: 'rangeDatePicker', title: i18n('filter_period')},
            getEngineFilterField(),
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
            const selectedState = state?.[0];

            dispatch(
                applyFilter({
                    user: onlyMine ? QueriesListAuthorFilter.My : QueriesListAuthorFilter.All,
                    from: range?.start?.valueOf(),
                    to: range?.end?.endOf('day').valueOf(),
                    engine: getSelectedEngine(engine),
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
            fields,
            initialValues,
            isChanged,
            onApply: handleApply,
            onReset: handleReset,
        }),
        [fields, handleApply, handleReset, initialValues, isChanged],
    );

    return {config, formKey};
}
