import React from 'react';
import block from 'bem-cn-lite';
import './EmptyPlaceholdersMessage.scss';
import EmptyChartIcon from '../../../../assets/img/svg/empty-chart.svg';

const b = block('empty-placeholders-message');

export function EmptyPlaceholdersMessage() {
    return (
        <div className={b()}>
            <EmptyChartIcon className={b('icon')} />
            Use the wizard on the left to build a chart
        </div>
    );
}
