import React, {useState} from 'react';
import block from 'bem-cn-lite';
import {TutorialsHistory} from '@gravity-ui/querieskit/modules/TutorialsHistory';
import {type QueryListLinkRenderer} from '@gravity-ui/querieskit';

import {useDispatch, useSelector} from '../../../../store/redux-hooks';
import {
    selectHasQueriesListMore,
    selectIsQueriesListLoading,
    selectQueriesFilters,
    selectTutorialQueriesList,
} from '../../../../store/selectors/query-tracker/queriesList';
import {selectQuery} from '../../../../store/selectors/query-tracker/query';
import {
    applyFilter,
    loadNextQueriesList,
} from '../../../../store/actions/query-tracker/queriesList';
import {QueriesHistoryCursorDirection} from '../../../../store/reducers/query-tracker/query-tracker-contants';
import {RoutedLink} from '../../../../containers/RoutedLink/RoutedLink';
import {Engines} from '../../../../types/query-tracker/api';
import {QueryEnginesNames} from '../../../../../shared/constants/engines';
import i18n from '../../QueriesList/QueriesTutorialList/i18n';
import tabsI18n from '../../QueriesList/i18n';
import {selectQueriesKitTutorialItems} from '../../../../store/selectors/query-tracker/querieskit';

import './TutorialsTab.scss';

const b = block('yt-querieskit-tutorials-tab');

const renderLink: QueryListLinkRenderer = ({href = '', ...props}) => (
    <RoutedLink {...props} href={href} view="primary" />
);

export function TutorialsTab() {
    const dispatch = useDispatch();
    const queries = useSelector(selectTutorialQueriesList);
    const loading = useSelector(selectIsQueriesListLoading);
    const hasMore = useSelector(selectHasQueriesListMore) && queries.length > 0;
    const selectedId = useSelector(selectQuery)?.id;
    const [search, setSearch] = useState('');
    const {engine} = useSelector(selectQueriesFilters);

    const noNameTitle = i18n('field_no-name');
    const items = useSelector((state) => selectQueriesKitTutorialItems(state, search, noNameTitle));

    const handleLoadMore = () => {
        if (hasMore && !loading) {
            dispatch(loadNextQueriesList(QueriesHistoryCursorDirection.PAST));
        }
    };

    return (
        <div className={b()}>
            <TutorialsHistory
                className={b('list')}
                title={tabsI18n('tab_tutorials')}
                search={{
                    value: search,
                    fullSearchAvailable: false,
                    hasClear: true,
                    onUpdate: ({value}) => setSearch(value),
                }}
                engineFilter={{
                    engines: Engines.map((id) => ({
                        id,
                        title: QueryEnginesNames[id],
                    })),
                    value: engine ?? null,
                    onUpdate: (id) => {
                        const selectedEngine = Engines.find((value) => value === id);
                        dispatch(applyFilter({engine: selectedEngine}));
                    },
                }}
                items={items}
                selectedRowId={selectedId}
                loading={loading}
                hasMore={hasMore}
                onLoadMore={handleLoadMore}
                renderLink={renderLink}
            />
        </div>
    );
}
