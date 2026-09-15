import React from 'react';

import UIFactory from '../../UIFactory';
import {MarkdownFallback} from './MarkdownFallback';

import './Markdown.scss';
import '@diplodoc/transform/dist/css/yfm.css';
import '@diplodoc/transform/dist/js/yfm';
import './yfm-overrides.scss';

interface Props {
    text: string;
    ref?: React.Ref<HTMLDivElement>;
    allowHTML?: boolean;
}

export const Markdown = React.memo(function Markdown({text}: Props) {
    if (!text) {
        return null;
    }
    const customMarkdown = UIFactory.renderMarkdown({text});
    return customMarkdown ?? <MarkdownFallback text={text} />;
});

Markdown.displayName = 'Markdown';
