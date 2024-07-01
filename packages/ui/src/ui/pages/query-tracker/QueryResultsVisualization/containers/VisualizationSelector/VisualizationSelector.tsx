import React, {useCallback, useMemo} from 'react';
import {Select} from '@gravity-ui/uikit';
import type {VisualizationId} from '../../types';
import {useSelector} from 'react-redux';
import {selectQueryResultVisualizationId} from '../../store/selectors';
import {useThunkDispatch} from '../../../../../store/thunkDispatch';

export function VisualizationSelector() {
    const visualizationId = useSelector(selectQueryResultVisualizationId);
    const dispatch = useThunkDispatch();

    const value = useMemo(() => {
        return [visualizationId];
    }, [visualizationId]);

    const options = useMemo(() => {
        return [
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
    }, []);

    const onUpdate = useCallback(
        ([visualization]: string[]) => {
            dispatch({
                type: 'set-visualization',
                data: visualization as VisualizationId,
            });
        },
        [dispatch],
    );

    return (
        <Select<VisualizationId> width={125} value={value} options={options} onUpdate={onUpdate} />
    );
}
