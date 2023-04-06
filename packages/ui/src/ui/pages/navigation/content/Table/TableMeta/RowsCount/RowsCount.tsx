import React from 'react';
import cn from 'bem-cn-lite';

import {Popover} from '@gravity-ui/uikit';
import Icon from '../../../../../../components/Icon/Icon';
import hammer from '../../../../../../common/hammer';

import './RowsCount.scss';

const block = cn('rows-count');

export function RowsCount(props: {count: number; isDynamic: boolean}) {
    const {count, isDynamic} = props;
    return (
        <React.Fragment>
            {isDynamic ? '≈ ' : ''}
            {hammer.format['Number'](count)}
            {!isDynamic ? null : (
                <Popover
                    content={
                        <span>
                            This value corresponds to the number of rows stored in the on-disk
                            chunks. The actual value may be different: it may be either larger due
                            to new rows residing only in memory or smaller due to unsynced deleted
                            rows and multiple versions stored on disks. It is not possible to
                            calculate the real value without reading all the rows.
                        </span>
                    }
                >
                    <span className={block('question')}>
                        <Icon awesome={'question-circle'} />
                    </span>
                </Popover>
            )}
        </React.Fragment>
    );
}
