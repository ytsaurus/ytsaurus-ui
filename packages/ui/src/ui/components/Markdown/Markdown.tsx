import React from 'react';
import cn from 'bem-cn-lite';
import axios from 'axios';

import {wrapApiPromiseByToaster} from '../../utils/utils';
import './Markdown.scss';

const block = cn('yt-markdown');

interface Props {
    text: string;
    allowHTML?: boolean;
}

interface Response {
    result?: {html?: string; plainText?: string};
}

export async function transformMarkdown({text, allowHTML}: Props) {
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
        return data;
    } catch (e) {
        return {};
    }
}

export function useMarkdown({text, allowHTML = true}: Props) {
    const [res, setResult] = React.useState<{result?: {html?: string; plainText?: string}}>({});

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

export function Markdown({text}: Props) {
    const {html} = useMarkdown({text, allowHTML: true}).result ?? {};

    return (
        <React.Fragment>
            <div className={block()} dangerouslySetInnerHTML={{__html: html ?? ''}} />
        </React.Fragment>
    );
}
