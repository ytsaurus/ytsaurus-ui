import React from 'react';
import {type QueryListFilterConfig} from '@gravity-ui/querieskit';

import {applyFilter, resetFilter} from '../../../../store/actions/query-tracker/queriesList';
import {useDispatch} from '../../../../store/redux-hooks';
import {type QueriesListFilter} from '../../../../types/query-tracker/queryList';
import {ALL_VALUE, getEngineFilterField, getSelectedEngine} from '../helpers/filters';

type FilterValues = {
    engine?: string[];
};

export function useTutorialsFilters(filter: QueriesListFilter) {
    const dispatch = useDispatch();
    const [formKey, setFormKey] = React.useState(0);

    const fields = React.useMemo<QueryListFilterConfig['fields']>(
        () => [getEngineFilterField()],
        [],
    );

    const initialValues = React.useMemo<FilterValues>(
        () => ({engine: [filter.engine ?? ALL_VALUE]}),
        [filter.engine],
    );

    const handleApply = React.useCallback(
        (values: Record<string, unknown>) => {
            const {engine} = values as FilterValues;
            dispatch(
                applyFilter({
                    engine: getSelectedEngine(engine),
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
            fields,
            initialValues,
            isChanged: Boolean(filter.engine),
            onApply: handleApply,
            onReset: handleReset,
        }),
        [fields, filter.engine, handleApply, handleReset, initialValues],
    );

    return {config, formKey};
}
