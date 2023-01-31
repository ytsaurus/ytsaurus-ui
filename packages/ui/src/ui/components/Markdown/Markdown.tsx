import React from 'react';
import cn from 'bem-cn-lite';
import transform from '@doc-tools/transform';

import './Markdown.scss';

const block = cn('yt-markdown');

interface Props {
    text: string;
    allowHTML?: boolean;
}

export function Markdown({text, allowHTML = false}: Props) {
    const {
        result: {html},
    } = React.useMemo(() => {
        return transform(text, {disableLiquid: true, allowHTML});
    }, [text, allowHTML]);

    return (
        <React.Fragment>
            <div className={block()} dangerouslySetInnerHTML={{__html: html}} />
        </React.Fragment>
    );
}
