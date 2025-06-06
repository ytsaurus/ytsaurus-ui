import React, {FC, useEffect} from 'react';
import throttle_ from 'lodash/throttle';
import block from 'bem-cn-lite';
import {type ChartKitRef} from '@gravity-ui/chartkit';
import {Chart} from './Chart';
import useResizeObserver from '../../../../hooks/useResizeObserver';
import './QueryResultsVisualization.scss';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {ChartLeftMenu} from './ChartLeftMenu';
import {useDispatch, useSelector} from 'react-redux';
import {changeVisualizationResultIndex} from '../../module/queryChart/actions';
import {selectChartLoading} from '../../module/queryChart/selectors';
import {Flex, Loader} from '@gravity-ui/uikit';

const b = block('query-result-visualization');

type Props = {
    resultIndex: number;
};

export const QueryResultsVisualization: FC<Props> = ({resultIndex}) => {
    const dispatch = useDispatch();
    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartKitRef = React.useRef<ChartKitRef>();
    const loading = useSelector(selectChartLoading);

    useEffect(() => {
        dispatch(changeVisualizationResultIndex(resultIndex));
    }, [dispatch, resultIndex]);

    const debouncedChartResize = React.useMemo(() => {
        return throttle_(() => {
            chartKitRef.current?.reflow();
        }, 300);
    }, []);

    useResizeObserver({
        element: containerRef.current ?? undefined,
        onResize: debouncedChartResize,
    });

    if (loading) {
        return (
            <Flex alignItems="center" justifyContent="center" className={b('loading')}>
                <Loader size="m" />
            </Flex>
        );
    }

    return (
        <div className={b()} ref={containerRef}>
            <ChartLeftMenu />
            <div className={b('chartkit-wrapper')}>
                <ErrorBoundary>
                    <Chart ref={chartKitRef} />
                </ErrorBoundary>
            </div>
        </div>
    );
};
