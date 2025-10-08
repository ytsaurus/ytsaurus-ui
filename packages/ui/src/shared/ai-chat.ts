export type McpMessage = {
    approval_request_id: string | null;
    arguments: Record<string, string>;
    error: null | Error;
    id: string;
    name: 'search_docs' | 'get_table_schema';
    output: string;
    server_label: 'server';
    type: 'mcp_call';
};

export interface LLMStreamEvent {
    type: string;
    delta?: string;
    item?: {
        id: string;
        type?: string;
        name?: string;
        output?: string | null;
    };
}

export interface AIChatConfig {
    baseUrl: string;
    model: string;
}

export type Conversation = {
    id: string;
    object: 'conversations';
    created_at: number;
    metadata: {
        topic?: string;
    };
};

export interface ConversationMessage {
    id: string;
    role: 'user' | 'assistant';
    status: 'completed' | 'in_progress' | 'failed' | 'cancelled';
    type: 'message';
    content: {type: string; text: string}[];
}

export interface GetConversationItemsResponse {
    data: (ConversationMessage | McpMessage)[];
    total: number;
    first_id: string;
    last_id: string;
    has_more: boolean;
}
