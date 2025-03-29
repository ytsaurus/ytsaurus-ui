import React from 'react';
import {PrometheusPlugins} from '../PrometheusDashKit';
import {Markdown} from '../../../components/Markdown/Markdown';

export const renderPluginText: PrometheusPlugins['text']['renderer'] = ({data}, elementRef) => {
    const {options} = data ?? {};
    const {mode, content} = options ?? {};
    return mode !== 'markdown' ? (
        <div ref={elementRef}>content</div>
    ) : (
        <Markdown ref={elementRef} text={content} />
    );
};
