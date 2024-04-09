import React from 'react';
import cn from 'bem-cn-lite';
import axios from 'axios';

import {wrapApiPromiseByToaster} from '../../utils/utils';
import './Markdown.scss';
import '@diplodoc/transform/dist/css/yfm.css';
import '@diplodoc/transform/dist/js/yfm';
import {OutputType} from '@diplodoc/transform/lib/typings';

const block = cn('yt-markdown');

interface Props {
    text: string;
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

export function Markdown({text}: Props) {
    const {html} = useMarkdown({text, allowHTML: true}).result ?? {};

    return (
        <React.Fragment>
            <div className={block(null, 'yfm')} dangerouslySetInnerHTML={{__html: html ?? ''}} />
        </React.Fragment>
    );
}
