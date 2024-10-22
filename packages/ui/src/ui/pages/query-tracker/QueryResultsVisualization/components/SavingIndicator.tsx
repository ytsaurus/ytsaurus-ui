import React from 'react';
import {useSelector} from 'react-redux';
import {selectQueryResultChartSaved} from '../../module/queryChart/selectors';
import {ArrowsRotateRight, CircleCheck} from '@gravity-ui/icons';
import {Icon, Tooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import './SavingIndicator.scss';

const b = block('saving-indicator');

export function SavingIndicator() {
    const saved = useSelector(selectQueryResultChartSaved);
    const tooltipContent = saved ? 'Saved' : 'Saving in progress';

    return (
        <Tooltip content={tooltipContent}>
            <Icon
                className={b({saving: !saved})}
                data={saved ? CircleCheck : ArrowsRotateRight}
                size={16}
            />
        </Tooltip>
    );
}
