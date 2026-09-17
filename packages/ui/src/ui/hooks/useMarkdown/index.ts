import {useEffect, useState} from 'react';
import axios from 'axios';

import {type OutputType} from '@diplodoc/transform/lib/typings';

import {wrapApiPromiseByToaster} from '../../utils/utils';
import i18n from './i18n';

type Params = {
    text: string;
    allowHTML?: boolean;
    linkify?: boolean;
    skipErrorToast?: boolean;
};

const transformMarkdown = async ({
    text,
    allowHTML,
    linkify,
    skipErrorToast,
}: Params): Promise<OutputType> => {
    const {data} = await wrapApiPromiseByToaster(
        axios.post<OutputType>('/api/markdown-to-html', {
            text,
            allowHTML,
            linkify,
        }),
        {
            toasterName: 'useMarkdown',
            skipSuccessToast: true,
            skipErrorToast,
            errorContent: i18n('alert_failed-to-transform'),
        },
    );
    return data;
};

type TransformMarkdownState = {
    data?: OutputType;
    loading: boolean;
    error?: unknown;
};

export const useMarkdown = ({
    text,
    allowHTML = true,
    linkify = false,
    skipErrorToast = false,
}: Params) => {
    const [state, setState] = useState<TransformMarkdownState>({loading: true});

    useEffect(() => {
        let active = true;
        setState({loading: true});

        const transform = async () => {
            try {
                const data = await transformMarkdown({text, allowHTML, linkify, skipErrorToast});

                if (active) {
                    setState({data, loading: false});
                }
            } catch (error) {
                if (active) {
                    setState({loading: false, error});
                }
            }
        };
        transform();

        return () => {
            active = false;
        };
    }, [text, allowHTML, linkify, skipErrorToast]);

    return state;
};
