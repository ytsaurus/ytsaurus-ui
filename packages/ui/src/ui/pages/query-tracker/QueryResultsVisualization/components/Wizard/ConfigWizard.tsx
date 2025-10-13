import React, {ChangeEvent, FC} from 'react';
import {Checkbox, Text, TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from '../../../../../store/redux-hooks';
import {selectChartConfig} from '../../../../../store/selectors/query-tracker/queryChart';
import cn from 'bem-cn-lite';
import {changeConfig} from '../../../../../store/actions/query-tracker/queryChart';
import './ConfigWizard.scss';

const b = cn('yt-chart-config-wizard');

export const ConfigWizard: FC = () => {
    const dispatch = useDispatch();
    const config = useSelector(selectChartConfig);

    const handleOnTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const {name, value, checked} = e.target;
        dispatch(
            changeConfig(
                name === 'legend'
                    ? {name, value: checked}
                    : {name: name as 'title' | 'xTitle' | 'yTitle', value},
            ),
        );
    };

    return (
        <div className={b()}>
            <Text variant="subheader-1">Chart config</Text>
            <TextInput
                placeholder="Chart title"
                name="title"
                value={config.title?.text}
                onChange={handleOnTitleChange}
                hasClear
            />
            <TextInput
                placeholder="X title:"
                name="xTitle"
                value={config.xAxis.title?.text}
                onChange={handleOnTitleChange}
                hasClear
            />
            <TextInput
                placeholder="Y title:"
                name="yTitle"
                value={config.yAxis ? config.yAxis[0]?.title?.text : ''}
                onChange={handleOnTitleChange}
                hasClear
            />
            <Checkbox
                content="Show legend"
                name="legend"
                checked={config.legend?.enabled}
                onChange={handleOnTitleChange}
            />
        </div>
    );
};
