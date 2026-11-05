import type {OpenAIConversationLike} from '@gravity-ui/aikit/adapters';

export type {ConversationItem} from 'openai/resources/conversations/items';

export interface AIChatConfig {
    baseUrl: string;
    model: string;
    metadata?: Record<string, string>;
    conversationLookup?: 'retrieve' | 'list';
}

export type Conversation = OpenAIConversationLike;

export interface ConversationPage<T> {
    data: T[];
    has_more: boolean;
    last_id?: string | null;
}
