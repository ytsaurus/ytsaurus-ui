import React from 'react';
import type {TextMessageContent} from '@gravity-ui/aikit';
import {Markdown} from '../../../components/Markdown/Markdown';
import {useDebouncedValue} from '../../../hooks/useDebouncedValue';

type Props = {part: TextMessageContent};

export function ChatMarkdown({part}: Props) {
    // Batch streaming updates, but keep rendering during a continuous response.
    const text = useDebouncedValue(part.data.text, 200, {maxWait: 500});
    return <Markdown text={text} errorMode="inline" />;
}
