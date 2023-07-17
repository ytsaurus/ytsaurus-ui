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

export function useMarkdown({text, allowHTML = true}: {text: string; allowHTML?: boolean}) {
    const [res, setResult] = React.useState<{result?: {html?: string; plainText?: string}}>({});

    React.useEffect(() => {
        async function transform() {
            try {
                const {data} = await wrapApiPromiseByToaster(
                    axios.post<typeof res>('/api/markdown-to-html', {
                        text,
                        allowHTML,
                    }),
                    {
                        toasterName: 'useMarkdown',
                        skipSuccessToast: true,
                        errorContent: 'Failed to transform markdown text',
                    },
                );
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
