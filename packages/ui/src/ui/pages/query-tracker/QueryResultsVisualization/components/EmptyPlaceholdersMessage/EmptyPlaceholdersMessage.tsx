import React from 'react';
import block from 'bem-cn-lite';
import './EmptyPlaceholdersMessage.scss';
import EmptyChartIcon from '../../../../../assets/img/svg/empty-chart.svg';
import i18n from './i18n';

const b = block('empty-placeholders-message');

export function EmptyPlaceholdersMessage() {
    return (
        <div className={b()}>
            <EmptyChartIcon className={b('icon')} />
            {i18n('context_use-wizard')}
        </div>
    );
}
