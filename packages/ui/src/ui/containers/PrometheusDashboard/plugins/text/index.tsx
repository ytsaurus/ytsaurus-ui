import React from 'react';
import cn from 'bem-cn-lite';

import {Markdown} from '../../../../components/Markdown/Markdown';

import {PrometheusPlugins} from '../../PrometheusDashKit';

import './text.scss';

const block = cn('yt-prometheus-text');

export const renderPluginText: PrometheusPlugins['text']['renderer'] = ({data}, elementRef) => {
    const {options} = data ?? {};
    const {mode, content} = options ?? {};

    return (
        <div ref={elementRef} className={block()}>
            {mode !== 'markdown' ? content : <Markdown text={content} />}
        </div>
    );
};
