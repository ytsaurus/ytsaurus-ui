import React from 'react';
import cn from 'bem-cn-lite';

import './Text.scss';
import unipika from '../../common/thor/unipika';
import {UNIPIKA_ESCAPED_SETTINGS} from '../../utils';

const block = cn('yt-text');

interface Props {
    className?: string;
    children: React.ReactNode;
}

export function Secondary({children, disabled}: Props & {disabled?: boolean}) {
    return <span className={block('secondary', {disabled})}>{children}</span>;
}

export function Bold({children}: Props) {
    return <span className={block('bold')}>{children}</span>;
}

export function SecondaryBold({children}: Props) {
    return (
        <Secondary>
            <Bold>{children}</Bold>
        </Secondary>
    );
}

export function Warning({children, className}: Props) {
    return <span className={block('warning', className)}>{children}</span>;
}

export function NoWrap({children}: Props) {
    return <span className={block('no-wrap')}>{children}</span>;
}

export function Escaped({text}: {text: string}) {
    const textNode = unipika.prettyprint(text, {
        ...UNIPIKA_ESCAPED_SETTINGS,
        asHTML: true,
    });
    return <span className={block('escaped')} dangerouslySetInnerHTML={{__html: textNode}} />;
}
