import type {Conversation} from '../../shared/ai-chat';

export interface CreateConversationRequest {
    model: string;
    metadata?: Record<string, any>;
}

export interface AttachedFile {
    name: string;
    content: string;
    type: string;
}

export interface SendMessageRequest {
    conversationId: string;
    message: string;
    model: string;
    metadata?: Record<string, any>;
    contextMessages?: string[];
    files?: AttachedFile[];
}

export interface GetConversationsResponse {
    conversations: Conversation[];
    total: number;
    has_more: boolean;
    last_id: string | null;
}
