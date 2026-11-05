import React, {useCallback, useEffect, useState} from 'react';
import type {MarkdownRendererProps} from '@gravity-ui/aikit/custom-markdown';
import {Loader} from '@gravity-ui/uikit';
import {YTErrorInline} from '../../../containers/YTErrorInline/YTErrorInline';
import type {YTError} from '../../../types';
import {Markdown} from '../../../components/Markdown/Markdown';
import type {MarkdownRenderState} from '../../../UIFactory';

type Props = MarkdownRendererProps;

type RenderState = {
    latestText: string;
    renderedText?: string;
    renderingText?: string;
    error?: unknown;
};

export function ChatMarkdown({content}: Props) {
    const [state, setState] = useState<RenderState>({latestText: ''});

    useEffect(() => {
        setState((previous) => {
            if (content === previous.latestText) return previous;
            if (!content && !previous.renderingText) return {latestText: ''};

            let renderingText = previous.renderingText;
            if (!renderingText && content !== previous.renderedText) {
                renderingText = content || undefined;
            }

            return {
                ...previous,
                latestText: content,
                renderingText,
                error: undefined,
            };
        });
    }, [content]);

    const handleRenderStateChange = useCallback((result: MarkdownRenderState, text: string) => {
        setState((previous) => {
            if (result.status === 'loading') return previous;
            if (text !== previous.renderingText) return previous;

            if (!previous.latestText || previous.latestText === previous.renderedText) {
                return {
                    latestText: previous.latestText,
                    renderedText: previous.latestText || undefined,
                };
            }

            const renderingText = previous.latestText !== text ? previous.latestText : undefined;
            return {
                latestText: previous.latestText,
                renderedText: result.status === 'ready' ? text : previous.renderedText,
                renderingText,
                error: result.status === 'error' && !renderingText ? result.error : undefined,
            };
        });
    }, []);

    const texts = [state.renderedText, state.renderingText].filter(
        (text): text is string => text !== undefined,
    );

    return (
        <>
            {texts.map((text) => (
                <div key={text} hidden={text !== state.renderedText}>
                    <Markdown
                        text={text}
                        errorMode="inline"
                        onRenderStateChange={handleRenderStateChange}
                    />
                </div>
            ))}
            {!state.renderedText && state.renderingText && <Loader size="s" />}
            {Boolean(state.error) && <YTErrorInline error={state.error as YTError | Error} />}
        </>
    );
}
