import React from 'react';
import {YTErrorBlock} from '../../../components/Error/Error';
import {AnswerBody} from './AnswerBody';
import {McpSearchAnswer} from './McpSearchAnswer';
import {McpSchemaAnswer} from './McpSchemaAnswer';
import {McpUnknownAnswer} from './McpUnknownAnswer';
import {ChatMessage} from '../../../types/ai-chat';

export const getMessageComponentByType = (message: ChatMessage, className?: string) => {
    switch (message.type) {
        case 'error': {
            return <YTErrorBlock className={className} error={message.error} />;
        }
        case 'answer': {
            return <AnswerBody className={className} message={message} />;
        }
        case 'mcp_search_answer': {
            return <McpSearchAnswer className={className} value={message.value} />;
        }
        case 'mcp_table_schema_answer': {
            return <McpSchemaAnswer className={className} value={message.value} />;
        }
        case 'mcp_unknown_answer': {
            return (
                <McpUnknownAnswer className={className} name={message.name} value={message.value} />
            );
        }
        default: {
            return <div className={className}>{message.value}</div>;
        }
    }
};
