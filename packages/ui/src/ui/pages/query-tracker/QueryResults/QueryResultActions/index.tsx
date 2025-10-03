import {Button, ControlGroupOption, Icon, RadioButton} from '@gravity-ui/uikit';
import {getQueryResult} from '../../../../store/selectors/queries/queryResult';
import block from 'bem-cn-lite';
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../../store/reducers';
import transposeIcon from '../../../../assets/img/svg/transpose.svg';
import {SET_QUERY_RESULTS_SETTINGS} from '../../../../store/reducers/queries/query-tracker-contants';
import {QueryItem} from '../../../../types/query-tracker/api';
import {
    QueryResultReadyState,
    QueryResultsViewMode,
} from '../../../../types/query-tracker/queryResult';
import {TableColumnsSelector} from './TableColumnsSelector';
import {QueryResultDownloadManager} from './QueryResultDownloadManager';

import './index.scss';

type Props = {
    query: QueryItem;
    resultIndex: number;
};

const b = block('query-result-actions');

const ModeVariants: ControlGroupOption[] = [
    {
        value: 'table',
        content: 'Full result',
    },
    {
        value: 'scheme',
        content: 'Scheme',
    },
];

export function QueryResultActions({query, resultIndex}: Props) {
    const dispatch = useDispatch();
    const queryResult = useSelector((state: RootState) =>
        getQueryResult(state, query.id, resultIndex),
    );

    const handleTransposedChange = useCallback(() => {
        dispatch({
            type: SET_QUERY_RESULTS_SETTINGS,
            data: {
                queryId: query.id,
                index: resultIndex,
                settings: {
                    transposed: !(queryResult as QueryResultReadyState)?.settings?.transposed,
                },
            },
        });
    }, [(queryResult as QueryResultReadyState)?.settings, dispatch]);

    const handleModeChange = useCallback(
        (mode: string) => {
            dispatch({
                type: SET_QUERY_RESULTS_SETTINGS,
                data: {
                    queryId: query.id,
                    index: resultIndex,
                    settings: {
                        viewMode: mode as QueryResultsViewMode,
                    },
                },
            });
        },
        [(queryResult as QueryResultReadyState)?.settings, dispatch],
    );

    const handleColumnsChange = useCallback(
        (items: string[]) => {
            dispatch({
                type: SET_QUERY_RESULTS_SETTINGS,
                data: {
                    queryId: query.id,
                    index: resultIndex,
                    settings: {
                        ...(queryResult as QueryResultReadyState)?.settings,
                        visibleColumns: items,
                    },
                },
            });
        },
        [(queryResult as QueryResultReadyState)?.settings, dispatch],
    );

    return queryResult?.resultReady === true ? (
        <div className={b()}>
            {queryResult?.settings?.viewMode === QueryResultsViewMode.Table && (
                <>
                    <Button
                        className={b('item')}
                        onClick={handleTransposedChange}
                        view={queryResult?.settings?.transposed ? 'action' : 'normal'}
                    >
                        <Icon data={transposeIcon} width={16} />
                    </Button>
                    <TableColumnsSelector
                        className={b('item')}
                        allColumns={queryResult.columns}
                        columns={queryResult.settings?.visibleColumns}
                        onChange={handleColumnsChange}
                    />
                    <QueryResultDownloadManager
                        queryId={query.id}
                        resultIndex={resultIndex}
                        className={b('item')}
                        allColumns={queryResult.columns}
                        visibleColumns={queryResult.settings?.visibleColumns}
                    />
                </>
            )}

            <RadioButton
                className={b('item')}
                options={ModeVariants}
                value={queryResult?.settings?.viewMode}
                onUpdate={handleModeChange}
            />
        </div>
    ) : null;
}
