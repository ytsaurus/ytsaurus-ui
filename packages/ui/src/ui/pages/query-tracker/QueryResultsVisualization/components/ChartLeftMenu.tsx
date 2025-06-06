import React, {FC, useEffect} from 'react';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {setVisualizationType} from '../../module/queryChart/queryChartSlice';
import {selectCurrentChartVisualization} from '../../module/queryChart/selectors';
import './ChartLeftMenu.scss';
import cn from 'bem-cn-lite';
import {ChartType} from '../constants';
import {ConfigWizard, Wizard} from './Wizard';
import {getQueryDraft} from '../../module/query/selectors';
import {saveQueryChartConfig} from '../../module/queryChart/actions';

const options: {value: (typeof ChartType)[keyof typeof ChartType]; content: string}[] = (
    Object.keys(ChartType) as Array<keyof typeof ChartType>
).map((key) => ({
    value: ChartType[key],
    content: `${key} chart`,
}));

const b = cn('yt-chart-left-menu');

export const ChartLeftMenu: FC = () => {
    const dispatch = useDispatch();
    const visualization = useSelector(selectCurrentChartVisualization);
    const {id} = useSelector(getQueryDraft);
    const {type} = visualization;

    useEffect(() => {
        if (!id) return;

        dispatch(saveQueryChartConfig());
    }, [id, visualization, dispatch]);

    const handleChangeVisualization = (val: string[]) => {
        dispatch(setVisualizationType(val[0] as ChartType));
    };

    return (
        <div className={b()}>
            <Select
                placeholder="Chart type"
                value={[type || '']}
                options={options}
                onUpdate={handleChangeVisualization}
                hasClear
            />
            {type && (
                <>
                    <div className={b('separator')}></div>
                    <Wizard />
                    <div className={b('separator')}></div>
                    <ConfigWizard />
                </>
            )}
        </div>
    );
};
