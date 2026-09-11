import React from 'react';
import cn from 'bem-cn-lite';

import {useMarkdown} from '../../hooks/useMarkdown';

const block = cn('yt-markdown');

type Props = {
    text: string;
};

export const MarkdownFallback = ({text}: Props) => {
    const {html} = useMarkdown({text, allowHTML: true}).result ?? {};

    return <div className={block(null, 'yfm')} dangerouslySetInnerHTML={{__html: html ?? ''}} />;
};
