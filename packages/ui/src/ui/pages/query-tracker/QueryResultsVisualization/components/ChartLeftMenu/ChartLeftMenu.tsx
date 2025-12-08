import React, {FC, useEffect} from 'react';
import {Select} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {setVisualizationType} from '../../../../../store/reducers/query-tracker/queryChartSlice';
import {selectCurrentChartVisualization} from '../../../../../store/selectors/query-tracker/queryChart';
import './ChartLeftMenu.scss';
import cn from 'bem-cn-lite';
import {ChartType} from '../../constants';
import {ConfigWizard, Wizard} from '../Wizard';
import {getQueryDraft} from '../../../../../store/selectors/query-tracker/query';
import {saveQueryChartConfig} from '../../../../../store/actions/query-tracker/queryChart';
import i18n from './i18n';

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
                placeholder={i18n('field_chart-type')}
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
