import type {Conversation} from '../../shared/ai-chat';

export interface CreateConversationRequest {
    model: string;
    metadata?: Record<string, any>;
}

export interface SendMessageRequest {
    conversationId: string;
    message: string;
    model: string;
    metadata?: Record<string, any>;
    contextMessages?: string[];
}

export interface GetConversationsResponse {
    conversations: Conversation[];
    total: number;
    has_more: boolean;
}
