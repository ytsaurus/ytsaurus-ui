import React from 'react';
import cn from 'bem-cn-lite';

import format from '../../../common/hammer/format';
import Label, {LabelTheme} from '../../../components/Label/Label';
import StatusBlock from '../../../components/StatusBlock/StatusBlock';
import ClipboardButton from '../../../components/ClipboardButton/ClipboardButton';
import {Tooltip} from '../../../components/Tooltip/Tooltip';
import {ClickableText} from '../../../components/ClickableText/ClickableText';

import './NodeColumns.scss';

const block = cn('yt-node-columns');

const ROLE_THEME = {
    default: 'default',
    control: 'default',
    data: 'default',
} as const;

const STATE_THEME: Record<string, LabelTheme> = {
    online: 'success',
    offline: 'danger',
} as const;

export function NodeColumnState({state}: {state: 'online' | 'offline' | string}) {
    const text = format.FirstUppercase(state);
    const theme = STATE_THEME[state] ?? 'default';

    return <Label theme={theme} className={block('state')} type="text" text={text} />;
}

export function NodeColumnBanned({banned}: {banned: boolean}) {
    return banned ? <StatusBlock text="B" theme="banned" /> : format.NO_VALUE;
}

export function NodeColumnRole({role}: {role: 'default' | 'control' | 'data'}) {
    const theme = ROLE_THEME[role] || 'info';
    const text = format.Address(role);

    return <Label theme={theme} type="text" text={text} />;
}

export function NodeColumnText({text}: {text: string}) {
    return (
        <div className={block('text', 'elements-column_with-hover-button')}>
            <div className={block('text-content')} title={text}>
                {text}
            </div>
            <ClipboardButton text={text} view="flat-secondary" size="s" />
        </div>
    );
}

export function ClickableId({
    text,
    onClick,
    allowTooltip,
    format = (v) => v,
}: {
    text: string;
    onClick?: () => void;
    allowTooltip?: boolean;
    format?: (v: string) => string;
}) {
    return (
        <div className="elements-column_type_id elements-column_with-hover-button">
            <ClickableText
                color="primary"
                onClick={() => onClick?.()}
                className={'elements-monospace elements-ellipsis'}
            >
                <Tooltip
                    className={block('clickable-column-tooltip')}
                    content={allowTooltip ? format(text) : null}
                >
                    {format(text)}
                </Tooltip>
            </ClickableText>
            &nbsp;
            <ClipboardButton text={text} view="flat-secondary" size="s" />
        </div>
    );
}
