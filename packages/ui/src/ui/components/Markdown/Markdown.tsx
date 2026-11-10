import React, {memo, useState} from 'react';
import UIFactory, {type MarkdownRenderState} from '../../UIFactory';
import {YTErrorBlock} from '../../containers/Block/Block';
import {YTErrorInline} from '../../containers/YTErrorInline/YTErrorInline';
import {type YTError} from '../../types';
import {MarkdownFallback} from './MarkdownFallback';

import './Markdown.scss';
import '@diplodoc/transform/dist/css/yfm.css';
import '@diplodoc/transform/dist/js/yfm';
import './yfm-overrides.scss';

type Props = {
    text: string;
    allowHTML?: boolean;
    errorMode?: 'block' | 'inline';
};

const MarkdownImpl = ({text, allowHTML = true, errorMode}: Props) => {
    const [renderState, setRenderState] = useState<MarkdownRenderState>({status: 'loading'});

    if (renderState.status === 'error') {
        const error = renderState.error as YTError | Error;

        return errorMode === 'inline' ? (
            <YTErrorInline error={error} />
        ) : (
            <YTErrorBlock error={error} />
        );
    }

    const customMarkdown = UIFactory.renderMarkdown({text, allowHTML, setRenderState});

    return (
        customMarkdown ?? (
            <MarkdownFallback text={text} allowHTML={allowHTML} setRenderState={setRenderState} />
        )
    );
};

export const Markdown = memo((props: Props) => {
    if (!props.text) {
        return null;
    }

    return <MarkdownImpl key={`${props.allowHTML ?? true}:${props.text}`} {...props} />;
});

Markdown.displayName = 'Markdown';
