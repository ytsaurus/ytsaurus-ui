import React, {FC} from 'react';
import './JobItem.scss';
import cn from 'bem-cn-lite';
import {Tooltip} from '@gravity-ui/uikit';

const block = cn('operation-job-item');

type Props = {
    color: string;
    tooltip: string;
    value?: number;
};

export const JobItem: FC<Props> = ({color, tooltip, value}) => {
    if (!value) return null;

    return (
        <Tooltip content={tooltip}>
            <div className={block()}>
                <div className={block('block')} style={{background: color}} /> {value}
            </div>
        </Tooltip>
    );
};
