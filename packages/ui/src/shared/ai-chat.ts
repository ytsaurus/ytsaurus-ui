import type {OpenAIConversationLike} from '@gravity-ui/aikit/adapters';

export type {ConversationItem} from 'openai/resources/conversations/items';

export interface AIChatConfig {
    baseUrl: string;
    /** Default model for chat messages; also used to generate conversation titles. */
    defaultModel: string;
    modelsQuery?: Record<string, string>;
    metadata?: Record<string, string>;
    conversationLookup?: 'retrieve' | 'list';
}

export interface AIChatModels {
    data: {id: string}[];
}

export type Conversation = OpenAIConversationLike;

export interface ConversationPage<T> {
    data: T[];
    has_more: boolean;
    last_id?: string | null;
}
