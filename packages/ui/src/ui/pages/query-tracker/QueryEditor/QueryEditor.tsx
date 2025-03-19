import React, {useEffect, useState} from 'react';
import block from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {isQueryExecuted, isQueryLoading} from '../module/query/selectors';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import './QueryEditor.scss';
import {useCurrentQuery} from '../QueryResults/hooks/useCurrentQuery';
import {useQueryACO} from '../QueryACO/useQueryACO';
import hammer from '../../../common/hammer';
import {updateTitle} from '../../../store/actions/global';
import {ResultView} from './ResultView';
import {QueryEditorView} from './QueryEditorView';

const b = block('query-container');

type ResultMode = 'full' | 'minimized' | 'split';
export default function QueryEditor({
    onStartQuery,
    showStatusInTitle,
}: {
    onStartQuery?: (queryId: string) => boolean | void;
    showStatusInTitle?: boolean;
}) {
    const dispatch = useDispatch();
    const query = useCurrentQuery();
    const {isQueryTrackerInfoLoading} = useQueryACO();

    const [resultViewMode, setResultViewMode] = useState<ResultMode>('minimized');

    const [partSizes, setSize] = useState([50, 50]);

    useEffect(() => {
        if (!query || !showStatusInTitle) return;

        const startDate = query.start_time
            ? hammer.format['DateTime'](query.start_time, {format: 'short'})
            : '';
        const title = query.annotations?.title || '';
        const state = query.state?.toUpperCase() || '';

        if (startDate || title || state) {
            dispatch(
                updateTitle({
                    path: `${title} ${state} ${startDate} @ ${query.engine}`,
                }),
            );
        }
    }, [dispatch, query, showStatusInTitle]);

    useEffect(() => {
        setResultViewMode('split');
    }, [query?.id]);

    const isExecuted = useSelector(isQueryExecuted);
    const isMainQueryLoading = useSelector(isQueryLoading);
    const isLoading = isQueryTrackerInfoLoading || isMainQueryLoading;

    return (
        <>
            {isLoading && (
                <div className={b('loading')}>
                    <Loader />
                </div>
            )}
            <FlexSplitPane
                className={b({[resultViewMode]: true})}
                direction={FlexSplitPane.VERTICAL}
                onResizeEnd={setSize}
                getInitialSizes={() => partSizes}
            >
                {resultViewMode !== 'full' && <QueryEditorView onStartQuery={onStartQuery} />}

                {query?.id && isExecuted && (
                    <ResultView
                        query={query}
                        setResultViewMode={setResultViewMode}
                        resultViewMode={resultViewMode}
                    />
                )}
            </FlexSplitPane>
        </>
    );
}
