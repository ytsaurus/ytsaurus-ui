import React from 'react';
import {ClipboardButton, Progress, ProgressTheme, Tooltip} from '@gravity-ui/uikit';

type Props = {
    committed: number;
    limit: number;
    progress: number;
    progressText: string;
    theme: ProgressTheme;
    total: number;
    uncommitted: number;
};

export function AccountsProgressCell(props: Props) {
    const {committed, uncommitted, theme, limit, progressText} = props;

    const stack = [
        {theme, value: (committed / limit) * 100},
        {color: 'black', value: (uncommitted / limit) * 100},
    ];

    return (
        <Tooltip
            content={
                <>
                    <ClipboardButton text={progressText} />
                    {progressText}
                </>
            }
            closeDelay={1000}
        >
            <Progress stack={stack} />
        </Tooltip>
    );
}
