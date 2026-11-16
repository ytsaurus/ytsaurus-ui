import React, {useEffect} from 'react';
import cn from 'bem-cn-lite';

import {type MarkdownSetRenderState} from '../../UIFactory';
import {useMarkdown} from '../../hooks/useMarkdown';

const block = cn('yt-markdown');

type Props = {
    text: string;
    allowHTML?: boolean;
    setRenderState?: MarkdownSetRenderState;
};

export const MarkdownFallback = ({text, allowHTML = true, setRenderState}: Props) => {
    const {data, loading, error} = useMarkdown({
        text,
        allowHTML,
        linkify: true,
        skipErrorToast: true,
    });
    const {html} = data?.result ?? {};

    useEffect(() => {
        if (error) {
            setRenderState?.({status: 'error', error});
        } else {
            setRenderState?.({status: loading ? 'loading' : 'ready'});
        }
    }, [error, loading, setRenderState]);

    return <div className={block(null, 'yfm')} dangerouslySetInnerHTML={{__html: html ?? ''}} />;
};
