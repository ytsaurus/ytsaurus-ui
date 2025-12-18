import React from 'react';
import {FlowNodeBase} from '../../../../../shared/yt-types';
import CollapsibleSection from '../../../../components/CollapsibleSection/CollapsibleSection';
import {FlowMessagesContent} from '../../../../pages/flow/Flow/FlowGraph/renderers/FlowGraphRenderer';
import i18n from './i18n';

export function FlowMessagesCollapsible({messages}: {messages?: FlowNodeBase['messages']}) {
    return messages?.length ? (
        <CollapsibleSection name={i18n('messages')}>
            <FlowMessagesContent data={messages} />
        </CollapsibleSection>
    ) : null;
}
