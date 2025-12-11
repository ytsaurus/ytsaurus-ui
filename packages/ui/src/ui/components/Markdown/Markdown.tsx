import React from 'react';
import cn from 'bem-cn-lite';
import axios from 'axios';

import {OutputType} from '@diplodoc/transform/lib/typings';

import {wrapApiPromiseByToaster} from '../../utils/utils';
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

interface Response {
    result?: {html?: string; plainText?: string};
}

const emptyTransformResponse: OutputType = {
    result: {html: '', headings: []},
    logs: {info: [], warn: [], error: [], disabled: []},
};

export async function transformMarkdown({text, allowHTML}: Props): Promise<OutputType> {
    try {
        const {data} = await wrapApiPromiseByToaster(
            axios.post<Response>('/api/markdown-to-html', {
                text,
                allowHTML,
            }),
            {
                toasterName: 'useMarkdown',
                skipSuccessToast: true,
                errorContent: 'Failed to transform markdown text',
            },
        );
        return data as OutputType;
    } catch (e) {
        return {
            result: {...emptyTransformResponse['result']},
            logs: {...emptyTransformResponse['logs'], error: [(e as Error).message]},
        };
    }
}

export function useMarkdown({text, allowHTML = true}: Props) {
    const [res, setResult] = React.useState<OutputType>(emptyTransformResponse);

    React.useEffect(() => {
        async function transform() {
            try {
                const data = await transformMarkdown({text, allowHTML});

                setResult(data);
            } catch (e) {}
        }
        transform();
    }, [text, allowHTML]);

    return res;
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
