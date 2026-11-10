import React, {type FC} from 'react';
import {Select} from '@gravity-ui/uikit';
import {Engines} from '../../../../../types/query-tracker/api';
import {type QueryEngine, QueryEnginesNames} from '../../../../../../shared/constants/engines';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectQueriesFilters} from '../../../../../store/selectors/query-tracker/queriesList';
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

type Props = {
    value?: QueryEngine;
    onChange: (value: QueryEngine | undefined) => void;
};

export function QueryEngineFilterField({value, onChange}: Props) {
    return (
        <Select
            options={getEnginesList()}
            value={[value || ALL_ENGINE_KEY]}
            onUpdate={([next]) =>
                onChange(next === ALL_ENGINE_KEY ? undefined : (next as QueryEngine))
            }
            placeholder={i18n('context_select-engine')}
        />
    );
}

export const QueryEngineFilter: FC = () => {
    const dispatch = useDispatch();
    const {engine} = useSelector(selectQueriesFilters);
    return (
        <QueryEngineFilterField
            value={engine}
            onChange={(value) => dispatch(applyFilter({engine: value}))}
        />
    );
};
