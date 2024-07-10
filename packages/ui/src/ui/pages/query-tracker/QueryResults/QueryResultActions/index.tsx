import {Button, ControlGroupOption, Icon, RadioButton} from '@gravity-ui/uikit';
import {getQueryResult} from '../../module/query_result/selectors';
import block from 'bem-cn-lite';
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {RootState} from '../../../../store/reducers';
import transposeIcon from '../../../../assets/img/svg/transpose.svg';
import NodesLeftIcon from '@gravity-ui/icons/svgs/nodes-left.svg';
import {SET_QUERY_RESULTS_SETTINGS} from '../../module/query_result/actions';
import {QueryItem} from '../../module/api';
import {QueryResultReadyState, QueryResultsViewMode} from '../../module/query_result/types';
import {TableColumnsSelector} from './TableColumnsSelector';
import {QueryResultDownloadManager} from './QueryResultDownloadManager';

import './index.scss';
import {isSupportedShareQuery} from '../../module/query_aco/selectors';
import {toggleShareQuery} from '../../module/query/actions';
import {SHARED_QUERY_ACO, getCurrentQueryACO} from '../../module/query/selectors';

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
    const showShareButton = useSelector(isSupportedShareQuery);
    const queryAco = useSelector(getCurrentQueryACO);

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

    const handleToggleShareQuery = useCallback(() => {
        dispatch(toggleShareQuery());
    }, [dispatch]);

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
                    {showShareButton && (
                        <Button
                            className={b('item')}
                            onClick={handleToggleShareQuery}
                            view="normal"
                        >
                            <Icon data={NodesLeftIcon} width={16} />{' '}
                            {queryAco === SHARED_QUERY_ACO ? 'Unshare' : 'Share'}
                        </Button>
                    )}
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
