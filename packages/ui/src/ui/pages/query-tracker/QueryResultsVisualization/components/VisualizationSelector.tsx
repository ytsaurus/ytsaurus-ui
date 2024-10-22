import React, {FC, useCallback} from 'react';
import {Select} from '@gravity-ui/uikit';
import type {VisualizationId} from '../types';
import {useDispatch, useSelector} from 'react-redux';
import {selectQueryResultVisualization} from '../../module/queryChart/selectors';
import {setVisualization} from '../../module/queryChart/queryChartSlice';

const options: {value: VisualizationId; content: string}[] = [
    {
        value: 'line',
        content: 'Line chart',
    },
    {
        value: 'bar-x',
        content: 'Bar chart',
    },
    {
        value: 'scatter',
        content: 'Scatter chart',
    },
];

export const VisualizationSelector: FC = () => {
    const visualization = useSelector(selectQueryResultVisualization);
    const dispatch = useDispatch();

    const onUpdate = useCallback(
        ([visualizationId]: string[]) => {
            dispatch(setVisualization({...visualization, id: visualizationId as VisualizationId}));
        },
        [dispatch, visualization],
    );

    return <Select width={125} value={[visualization.id]} options={options} onUpdate={onUpdate} />;
};
