import React from 'react';
import cn from 'bem-cn-lite';

import {useMarkdown} from '../../hooks/useMarkdown';
import UIFactory from '../../UIFactory';

import './Markdown.scss';
import '@diplodoc/transform/dist/css/yfm.css';
import '@diplodoc/transform/dist/js/yfm';
import './yfm-overrides.scss';

const block = cn('yt-markdown');

interface Props {
    text: string;
    ref?: React.Ref<HTMLDivElement>;
    allowHTML?: boolean;
}

const MarkdownImpl = React.forwardRef(function MD({text}: Props, ref: React.Ref<HTMLDivElement>) {
    const {html} = useMarkdown({text, allowHTML: true}).result ?? {};

    return (
        <div
            className={block(null, 'yfm')}
            dangerouslySetInnerHTML={{__html: html ?? ''}}
            ref={ref}
        />
    );
});

export const Markdown = React.memo(function Markdown({text}: Props) {
    if (!text) {
        return null;
    }
    const customMarkdown = UIFactory.renderMarkdown({text});
    return customMarkdown ?? <MarkdownImpl text={text} />;
});

Markdown.displayName = 'Markdown';
