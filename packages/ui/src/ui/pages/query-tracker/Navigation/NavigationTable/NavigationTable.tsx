import React, {type FC, useCallback} from 'react';
import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {NavigationTable as NavigationTableComponent} from '@ytsaurus/components/modules';
import {
    selectNavigationClusterConfig,
    selectNavigationFilter,
    selectNavigationPath,
    selectTableWithFilter,
} from '../../../../store/selectors/query-tracker/queryNavigation';
import {getQueryEngine} from '../../../../store/selectors/query-tracker/query';
import {getPageSize} from '../../../../store/selectors/navigation/content/table-ts';
import {setFilter} from '../../../../store/reducers/query-tracker/queryNavigationSlice';
import {useMonaco} from '../../hooks/useMonaco';
import {createTableSelect} from '../helpers/createTableSelect';
import {insertTextWhereCursor} from '../helpers/insertTextWhereCursor';

export const NavigationTable: FC = () => {
    const dispatch = useDispatch();
    const clusterConfig = useSelector(selectNavigationClusterConfig);
    const table = useSelector(selectTableWithFilter);
    const engine = useSelector(getQueryEngine);
    const limit = useSelector(getPageSize);
    const path = useSelector(selectNavigationPath);
    const filter = useSelector(selectNavigationFilter);
    const {getEditor} = useMonaco();

    const handleInsertTableSelect = useCallback(async () => {
        if (!clusterConfig) return;
        const editor = getEditor('queryEditor');
        const text = await createTableSelect({clusterConfig, path, engine, limit});
        insertTextWhereCursor(text, editor);
    }, [clusterConfig, path, engine, limit, getEditor]);

    const handleFilterChange = useCallback(
        (value: string) => {
            dispatch(setFilter(value));
        },
        [dispatch],
    );

    return (
        <NavigationTableComponent
            table={table}
            filter={filter}
            onFilterChange={handleFilterChange}
            onInsertTableSelect={handleInsertTableSelect}
        />
    );
};
