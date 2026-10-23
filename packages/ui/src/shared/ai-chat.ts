import {type ResponseInput} from 'openai/resources/responses/responses';

export interface AIChatConfig {
    baseUrl: string;
    model: string;
    metadata?: Record<string, string>;
    conversationLookup?: 'retrieve' | 'list';
}

// Build a standard user turn, retaining its context and attachments for subsequent requests.
export function createResponseInput({
    message,
    contextMessages = [],
    files = [],
}: {
    message: string;
    contextMessages?: string[];
    files?: {name: string; content: string}[];
}): ResponseInput {
    return [
        {
            role: 'user',
            content: [
                ...contextMessages.map((text) => ({type: 'input_text' as const, text})),
                {type: 'input_text', text: message},
                ...files.map((file) => ({
                    type: 'input_text' as const,
                    text: `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``,
                })),
            ],
        },
    ];
}

export interface Conversation {
    id: string;
    created_at: number;
    metadata?: {topic?: string} | null;
}

export interface ConversationItem {
    id: string;
    type: string;
    role?: string;
    content?: unknown[];
    name?: string;
    arguments?: string;
    server_label?: string;
    status?: string;
    output?: string | null;
    error?: string | null;
}

export interface ConversationPage<T> {
    data: T[];
    has_more: boolean;
    last_id?: string | null;
}
