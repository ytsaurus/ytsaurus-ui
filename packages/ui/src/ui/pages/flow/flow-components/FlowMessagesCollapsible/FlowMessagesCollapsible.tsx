import React from 'react';
import {FlowNodeBase} from '../../../../../shared/yt-types';
import CollapsibleSection, {
    CollapsibleSectionProps,
} from '../../../../components/CollapsibleSection/CollapsibleSection';
import {FlowMessagesContent} from '../../../../pages/flow/Flow/FlowGraph/renderers/FlowGraphRenderer';
import i18n from './i18n';

export function FlowMessagesCollapsible({
    messages,
    marginDirection,
}: {messages?: FlowNodeBase['messages']} & Pick<CollapsibleSectionProps, 'marginDirection'>) {
    return messages?.length ? (
        <CollapsibleSection name={i18n('messages')} marginDirection={marginDirection}>
            <FlowMessagesContent data={messages} />
        </CollapsibleSection>
    ) : null;
}
