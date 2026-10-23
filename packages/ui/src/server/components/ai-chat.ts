import {
    BASE_PROMPT_FOR_SUMMARIZATION,
    OpenAIService,
    ResponseStream,
} from '@gravity-ui/aikit/server/openai';
import {type AIChatConfig, type Conversation, type ConversationPage} from '../../shared/ai-chat';
import {type SendMessageRequest} from '../types/ai-chat';

export class AiChat {
    private config: AIChatConfig;
    private readonly authHeaders?: Record<string, string | undefined>;

    constructor(config: AIChatConfig, authHeaders?: Record<string, string | undefined>) {
        this.config = config;
        this.authHeaders = authHeaders;
    }

    createConversation(metadata: Record<string, string>) {
        return this.getClient().conversations.create({metadata});
    }

    getConversations(after?: string) {
        // Listing conversations is an extension of the configured chat backend.
        return this.getClient().get<ConversationPage<Conversation>>('/conversations', {
            query: {limit: 20, ...(after ? {after} : {})},
        });
    }

    getConversationItems(conversationId: string, after?: string) {
        return this.getClient().conversations.items.list(conversationId, {
            order: 'desc',
            limit: 50,
            after,
        });
    }

    deleteConversation(conversationId: string) {
        return this.getClient().conversations.delete(conversationId);
    }

    async sendMessage(request: SendMessageRequest, signal?: AbortSignal) {
        // AIKit 2.25 createResponseStream does not accept request options yet.
        // Keep the signal on the SDK request to cancel before response headers arrive.
        const stream = await this.getClient().responses.create(
            {
                model: this.config.model,
                stream: true,
                conversation: request.conversation,
                input: request.input,
                metadata: {...this.config.metadata, ...request.metadata},
            },
            {signal},
        );
        return new ResponseStream(stream);
    }

    async summarizeConversationTitle(conversationId: string, metadata?: Record<string, string>) {
        const client = this.getClient();
        const {data} = await client.conversations.items.list(conversationId, {
            limit: 5,
            order: 'asc',
        });
        const context = data
            .flatMap((item) => {
                if (item.type !== 'message') return [];
                const text = item.content
                    .flatMap((part) => ('text' in part ? [part.text] : []))
                    .join('\n');
                return text ? [`${item.role}: ${text}`] : [];
            })
            .join('\n');
        // AIKit 2.25 summarizeConvTitle only reads output[0].content[0], which may
        // be reasoning or a tool call. The SDK collects text across the response.
        const response = await client.responses.create({
            model: this.config.model,
            metadata: {...this.config.metadata, ...metadata},
            input: [
                {
                    role: 'user',
                    content: [{type: 'input_text', text: BASE_PROMPT_FOR_SUMMARIZATION}],
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'input_text',
                            text: `Create a short title for this conversation:\n\n${context}`,
                        },
                    ],
                },
            ],
        });
        const title = response.output_text.trim();
        if (!title) throw new Error('Failed to generate conversation title');
        const conversation = await this.getConversation(conversationId);
        const conversationMetadata = conversation.metadata;
        await client.conversations.update(conversationId, {
            metadata: {
                ...(conversationMetadata &&
                typeof conversationMetadata === 'object' &&
                !Array.isArray(conversationMetadata)
                    ? conversationMetadata
                    : {}),
                topic: title,
            },
        });
        return title;
    }

    private async getConversation(conversationId: string) {
        if (this.config.conversationLookup !== 'list') {
            return this.getClient().conversations.retrieve(conversationId);
        }
        let after: string | undefined;
        const seenCursors = new Set<string>();
        for (;;) {
            const page = await this.getConversations(after);
            const found = page.data.find(({id}) => id === conversationId);
            if (found) return found;
            if (!page.has_more || !page.last_id || seenCursors.has(page.last_id)) {
                throw new Error('Cannot find conversation metadata to update its title');
            }
            after = page.last_id;
            seenCursors.add(after);
        }
    }

    private getClient() {
        const apiKey = process.env.YTFRONT_AI_CHAT_API_KEY;
        const client = new OpenAIService({
            model: this.config.model,
            baseURL: this.config.baseUrl.replace(/\/+$/, ''),
            apiKey: apiKey || '',
            organization: null,
            defaultHeaders: {
                ...(apiKey ? {} : {Authorization: null}),
                ...this.authHeaders,
            },
            maxRetries: 0,
            logLevel: 'off',
        });
        // AIKit narrows the constructor's project option to string, unlike the SDK.
        client.project = null;
        return client;
    }
}
