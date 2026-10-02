import React from 'react';
import {type QueryListFilterConfig} from '@gravity-ui/querieskit';

import {QueryEnginesNames} from '../../../../../shared/constants/engines';
import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import {Engines} from '../../../../types/query-tracker/api';
import {type QueriesListFilter} from '../../../../types/query-tracker/queryList';
import i18n from '../i18n';

const ALL_VALUE = '__all';

type FilterValues = {
    engine?: string[];
};

export function useTutorialsFilters(filter: QueriesListFilter) {
    const dispatch = useDispatch();
    const [formKey, setFormKey] = React.useState(0);

    const fields = React.useMemo(
        () => [
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
        ],
        [],
    );

    const initialValues = React.useMemo<FilterValues>(
        () => ({engine: [filter.engine ?? ALL_VALUE]}),
        [filter.engine],
    );

    const handleApply = React.useCallback(
        (values: Record<string, unknown>) => {
            const selectedEngine = (values as FilterValues).engine?.[0];
            dispatch(
                applyFilter({
                    engine:
                        selectedEngine && selectedEngine !== ALL_VALUE
                            ? (selectedEngine as QueriesListFilter['engine'])
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

    const config = React.useMemo<QueryListFilterConfig>(
        () => ({
            fields: fields as unknown as QueryListFilterConfig['fields'],
            initialValues,
            isChanged: Boolean(filter.engine),
            onApply: handleApply,
            onReset: handleReset,
        }),
        [fields, filter.engine, handleApply, handleReset, initialValues],
    );

    return {config, formKey};
}
