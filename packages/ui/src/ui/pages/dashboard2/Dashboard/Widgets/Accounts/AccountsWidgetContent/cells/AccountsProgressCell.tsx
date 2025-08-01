import React from 'react';
import {ClipboardButton, Progress} from '@gravity-ui/uikit';
import b from 'bem-cn-lite';

import format from '../../../../../../../common/hammer/format';

import {Resource} from '../../../../../../../store/api/dashboard2/accounts/accounts';

import {Tooltip} from '../../../../../../../components/Tooltip/Tooltip';

import './AccountsProgressCell.scss';

const block = b('progress-cell');

type Props = Resource & {type: 'Number' | 'Bytes'};

export function AccountsProgressCell(props: Props) {
    const {committed, uncommitted, theme, limit, progressText, type} = props;

    if (committed === undefined || limit === undefined || uncommitted === undefined) {
        return <Progress text={'- / -'} value={0} />;
    }

    const stack = [
        {theme, value: (committed / (limit || 1)) * 100},
        {color: 'var(--default-color)', value: (uncommitted / (limit || 1)) * 100},
    ];

    return (
        <Tooltip
            content={
                <>
                    <ClipboardButton text={progressText ?? '- / -'} />
                    {progressText}
                </>
            }
            className={block('tooltip')}
        >
            <Progress
                stack={stack}
                text={`${format[type](committed + uncommitted)} / ${format[type](limit)}`}
            />
        </Tooltip>
    );
}
