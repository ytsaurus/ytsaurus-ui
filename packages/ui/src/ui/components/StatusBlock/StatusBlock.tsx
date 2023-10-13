import React from 'react';
import block from 'bem-cn-lite';
import _ from 'lodash';

import {Tooltip} from '../../components/Tooltip/Tooltip';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';

import './StatusBlock.scss';

const b = block('status-block');

function StatusBlock({
    text,
    theme = 'default',
}: {
    text: string | number;
    theme?:
        | 'banned'
        | 'warning'
        | 'info'
        | 'success'
        | 'danger'
        | 'full'
        | 'alerts'
        | 'default'
        | 'decommissioned';
}) {
    return (
        <Tooltip
            className={b('container')}
            content={
                <React.Fragment>
                    <ClipboardButton text={text} view="clear" /> {text}
                </React.Fragment>
            }
        >
            <span className={b({theme: theme})}>{text}</span>
        </Tooltip>
    );
}

export default StatusBlock;
