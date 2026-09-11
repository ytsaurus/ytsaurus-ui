import {useEffect, useState} from 'react';
import axios from 'axios';

import {type OutputType} from '@diplodoc/transform/lib/typings';

import {wrapApiPromiseByToaster} from '../../utils/utils';
import i18n from './i18n';

type Params = {
    text: string;
    allowHTML?: boolean;
};

type Response = {
    result?: {html?: string; plainText?: string};
};

const emptyTransformResponse: OutputType = {
    result: {html: '', headings: []},
    logs: {info: [], warn: [], error: [], disabled: []},
};

const transformMarkdown = async ({text, allowHTML}: Params): Promise<OutputType> => {
    try {
        const {data} = await wrapApiPromiseByToaster(
            axios.post<Response>('/api/markdown-to-html', {
                text,
                allowHTML,
            }),
            {
                toasterName: 'useMarkdown',
                skipSuccessToast: true,
                errorContent: i18n('alert_failed-to-transform'),
            },
        );
        return data as OutputType;
    } catch (error) {
        return {
            result: {...emptyTransformResponse['result']},
            logs: {...emptyTransformResponse['logs'], error: [(error as Error).message]},
        };
    }
};

export const useMarkdown = ({text, allowHTML = true}: Params) => {
    const [result, setResult] = useState<OutputType>(emptyTransformResponse);

    useEffect(() => {
        const transform = async () => {
            try {
                const data = await transformMarkdown({text, allowHTML});

                setResult(data);
            } catch (error) {}
        };
        transform();
    }, [text, allowHTML]);

    return result;
};
