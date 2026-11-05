import React from 'react';
import {type TAssistantMessage} from '@gravity-ui/aikit';
import {YTErrorBlock} from '../../Block/Block';

export function MessageError({message}: {message: TAssistantMessage}) {
    return message.error instanceof Error ? <YTErrorBlock error={message.error} /> : null;
}
