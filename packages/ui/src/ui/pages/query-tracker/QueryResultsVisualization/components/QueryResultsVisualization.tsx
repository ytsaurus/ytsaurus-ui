import React from 'react';
import throttle_ from 'lodash/throttle';
import block from 'bem-cn-lite';
import {type ChartKitRef} from '@gravity-ui/chartkit';
import {Chart} from './Chart';
import useResizeObserver from '../../../../hooks/useResizeObserver';
import './QueryResultsVisualization.scss';
import ErrorBoundary from '../../../../components/ErrorBoundary/ErrorBoundary';
import {ChartLeftMenu} from './ChartLeftMenu';

const b = block('query-result-visualization');

export function QueryResultsVisualization() {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const chartKitRef = React.useRef<ChartKitRef>();

    const debouncedChartResize = React.useMemo(() => {
        return throttle_(() => {
            chartKitRef.current?.reflow();
        }, 300);
    }, []);

    useResizeObserver({
        element: containerRef.current ?? undefined,
        onResize: debouncedChartResize,
    });

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
}
