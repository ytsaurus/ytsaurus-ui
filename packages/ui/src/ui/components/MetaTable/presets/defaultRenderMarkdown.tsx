import React from 'react';
import {type MetaTableRenderMarkdownParams} from '@ytsaurus/components';
import {Markdown} from '../../Markdown/Markdown';

export const renderDefaultMarkdown = ({
    text,
    allowHTML,
    errorMode,
}: MetaTableRenderMarkdownParams) => {
    return <Markdown text={text} allowHTML={allowHTML} errorMode={errorMode} />;
};
