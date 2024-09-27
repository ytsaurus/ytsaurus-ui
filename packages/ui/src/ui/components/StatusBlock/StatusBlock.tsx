import React from 'react';
import block from 'bem-cn-lite';

import {Tooltip} from '../../components/Tooltip/Tooltip';
import ClipboardButton from '../../components/ClipboardButton/ClipboardButton';

import './StatusBlock.scss';

const b = block('status-block');

export type StatusBlockTheme =
    | 'banned'
    | 'warning'
    | 'info'
    | 'success'
    | 'danger'
    | 'full'
    | 'alerts'
    | 'default'
    | 'decommissioned';

function StatusBlock({text, theme = 'default'}: {text: string | number; theme?: StatusBlockTheme}) {
    return (
        <Tooltip
            className={b({theme: theme})}
            content={
                <React.Fragment>
                    <ClipboardButton text={text} view="clear" /> {text}
                </React.Fragment>
            }
        >
            {text}
        </Tooltip>
    );
}

export default StatusBlock;
