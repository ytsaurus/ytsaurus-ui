import React, {FC, useCallback} from 'react';
import {Select} from '@gravity-ui/uikit';
import {Engines} from '../../../../types/query-tracker/api';
import {QueryEngine, QueryEnginesNames} from '../../../../../shared/constants/engines';
import {useDispatch, useSelector} from 'react-redux';
import {getQueriesFilters} from '../../../../store/selectors/queries/queriesList';
import {applyFilter} from '../../../../store/actions/queries/queriesList';

const ALL_ENGINE_KEY = '__all';

const enginesList = [
    {
        value: ALL_ENGINE_KEY,
        content: 'All',
    },
    ...Engines.map((engine) => {
        return {
            value: engine,
            content: QueryEnginesNames[engine],
        };
    }),
];

export const QueryEngineFilter: FC = () => {
    const dispatch = useDispatch();
    const {engine} = useSelector(getQueriesFilters);

    const onChangeEngineFilter = useCallback(
        (values: string[]) => {
            const selectedEngine = values[0];
            dispatch(
                applyFilter({
                    engine:
                        selectedEngine === ALL_ENGINE_KEY
                            ? undefined
                            : (selectedEngine as QueryEngine),
                }),
            );
        },
        [dispatch],
    );

    return (
        <Select
            options={enginesList}
            value={[engine || ALL_ENGINE_KEY]}
            onUpdate={onChangeEngineFilter}
            placeholder="Select engine"
        />
    );
};
