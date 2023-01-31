import React from 'react';
import cn from 'bem-cn-lite';

import {Progress} from '@gravity-ui/uikit';
import {Event} from '../../../utils/operations/tabs/details/events/events';

import hammer from '../../../common/hammer';
import templates, {
    printColumnAsTime,
    printColumnAsTimeDurationWithMs,
    printColumnAsReadableField,
} from '../../../components/templates/utils';

const block = cn('operation-detail');

templates.add('operations/detail/events', {
    start_time: printColumnAsTime,
    finish_time: printColumnAsTime,
    duration(item, columnName) {
        return Event.isNotFinalState(item)
            ? printColumnAsTimeDurationWithMs.call(this, item, columnName)
            : hammer.format.NO_VALUE;
    },
    progress(item, columnName) {
        if (Event.isNotFinalState(item) && item.state !== 'total') {
            const progress = item.progress.duration;
            const column = this.getColumn(columnName);
            const {theme, value} = column.get(item);

            return (
                <div className={block('events-progress', {theme})}>
                    <span
                        className={block('events-progress-percentage', 'elements-secondary-text')}
                    >
                        {hammer.format['Percent'](progress)}
                    </span>

                    <Progress value={value} view="thin" />
                </div>
            );
        }
    },
    state: printColumnAsReadableField,
});
