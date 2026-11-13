import React, {type FC, useEffect, useState} from 'react';
import block from 'bem-cn-lite';
import {Loader} from '@gravity-ui/uikit';
import {useSelector} from '../../../store/redux-hooks';
import {
    selectIsQueryExecuted,
    selectIsQueryLoading,
} from '../../../store/selectors/query-tracker/query';
import FlexSplitPane from '../../../components/FlexSplitPane/FlexSplitPane';
import './QueryEditor.scss';
import {useCurrentQuery} from '../QueryResults/hooks/useCurrentQuery';
import {useQueryACO} from '../QueryACO/useQueryACO';
import {ResultView} from './ResultView';
import {QueryEditorView} from './QueryEditorView';

const b = block('query-container');

type Props = {
    onStartQuery?: (queryId: string) => boolean | void;
    pathNavigation?: boolean;
    hideAco?: boolean;
};

export type ResultMode = 'full' | 'minimized' | 'split';

export const QueryEditor: FC<Props> = ({onStartQuery, pathNavigation, hideAco}) => {
    const query = useCurrentQuery();
    const {isQueryTrackerInfoLoading} = useQueryACO();

    const [resultViewMode, setResultViewMode] = useState<ResultMode>('minimized');

    const [partSizes, setSize] = useState([50, 50]);

    useEffect(() => {
        setResultViewMode('split');
    }, [query?.id]);

    const isExecuted = useSelector(selectIsQueryExecuted);
    const isMainQueryLoading = useSelector(selectIsQueryLoading);
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
                {resultViewMode !== 'full' && (
                    <QueryEditorView
                        onStartQuery={onStartQuery}
                        pathNavigation={pathNavigation}
                        hideAco={hideAco}
                    />
                )}

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
};
