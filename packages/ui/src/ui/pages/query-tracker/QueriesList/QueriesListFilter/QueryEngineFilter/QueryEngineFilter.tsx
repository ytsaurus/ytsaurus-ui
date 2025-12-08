import React, {FC, useCallback} from 'react';
import {Select} from '@gravity-ui/uikit';
import {Engines} from '../../../../../types/query-tracker/api';
import {QueryEngine, QueryEnginesNames} from '../../../../../../shared/constants/engines';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {getQueriesFilters} from '../../../../../store/selectors/query-tracker/queriesList';
import {applyFilter} from '../../../../../store/actions/query-tracker/queriesList';
import i18n from './i18n';

const ALL_ENGINE_KEY = '__all';

const getEnginesList = () => [
    {
        value: ALL_ENGINE_KEY,
        content: i18n('value_all'),
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
            options={getEnginesList()}
            value={[engine || ALL_ENGINE_KEY]}
            onUpdate={onChangeEngineFilter}
            placeholder={i18n('context_select-engine')}
        />
    );
};
