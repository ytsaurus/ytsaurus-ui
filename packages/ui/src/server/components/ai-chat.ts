import axios from 'axios';
import {AIChatConfig, GetConversationItemsResponse} from '../../shared/ai-chat';
import {CreateConversationRequest, SendMessageRequest} from '../types/ai-chat';
import serverFactory from '../ServerFactory';
import {Request} from '@gravity-ui/expresskit';

const TITLE_CONTEXT_ITEMS_COUNT = 5;

export class AiChat {
    private config: AIChatConfig;

    constructor(config: AIChatConfig) {
        this.config = config;
    }

    async createConversation(data: CreateConversationRequest, req: Request) {
        return await axios.request({
            url: '/v1/conversations',
            baseURL: this.config.baseUrl,
            method: 'POST',
            data: {
                model: this.config.model,
                metadata: data.metadata,
            },
            headers: this.getRequestHeaders(req),
            responseType: 'stream',
        });
    }

    async getConversations(limit: number | undefined, after: string | undefined, req: Request) {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (after) params.append('after', after);

        return await axios.request({
            url: `/v1/conversations?${params.toString()}`,
            baseURL: this.config.baseUrl,
            method: 'GET',
            headers: this.getRequestHeaders(req),
            responseType: 'stream',
        });
    }

    async getConversationItems(
        conversationId: string,
        limit: number | undefined,
        after: string | undefined,
        order: 'asc' | 'desc' | undefined,
        req: Request,
        useStream = true,
    ) {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (after) params.append('after', after);
        if (order) params.append('order', order);

        return await axios.request<GetConversationItemsResponse>({
            url: `/v1/conversations/${conversationId}/items?${params.toString()}`,
            baseURL: this.config.baseUrl,
            method: 'GET',
            headers: this.getRequestHeaders(req),
            responseType: useStream ? 'stream' : 'json',
        });
    }

    async sendMessage(request: SendMessageRequest, req: Request) {
        const headers = this.getRequestHeaders(req);
        const inputMessages = [];

        if (request.contextMessages && request.contextMessages.length > 0) {
            request.contextMessages.forEach((contextMessage, index) => {
                inputMessages.push({
                    content: [
                        {
                            text: contextMessage,
                            type: 'input_text',
                        },
                    ],
                    id: `msg_context_${Date.now()}_${index}`,
                    role: 'user',
                    status: 'completed',
                    type: 'message',
                });
            });
        }

        const messageContent: any[] = [
            {
                text: request.message,
                type: 'input_text',
            },
        ];

        if (request.files && request.files.length > 0) {
            request.files.forEach((file) => {
                messageContent.push({
                    text: `File: ${file.name}\n\`\`\`\n${file.content}\n\`\`\``,
                    type: 'input_text',
                });
            });
        }

        inputMessages.push({
            content: messageContent,
            id: `msg_${Date.now()}`,
            role: 'user',
            status: 'completed',
            type: 'message',
        });

        const response = await axios.request({
            url: '/v1/responses',
            baseURL: this.config.baseUrl,
            method: 'POST',
            data: {
                stream: true,
                model: this.config.model,
                metadata: request.metadata,
                conversation: request.conversationId,
                input: inputMessages,
            },
            headers,
            responseType: 'stream',
        });

        return response.data;
    }

    async deleteConversation(conversationId: string, req: Request) {
        return await axios.request({
            url: `/v1/conversations/${conversationId}`,
            baseURL: this.config.baseUrl,
            method: 'DELETE',
            headers: this.getRequestHeaders(req),
            responseType: 'stream',
        });
    }

    async summarizeConversationTitle(conversationId: string, req: Request): Promise<string> {
        const {
            data: {data},
        } = await this.getConversationItems(
            conversationId,
            TITLE_CONTEXT_ITEMS_COUNT,
            undefined,
            'asc',
            req,
            false,
        );

        if (!data.length) {
            throw new Error('Conversation is empty');
        }

        const conversationContext = data
            .filter((item) => 'role' in item)
            .map((item) => {
                const textContent = item.content
                    .filter((c) => !c.text.startsWith('<rag_context>'))
                    .map((c) => c.text)
                    .join(' ');
                return `${item.role}: ${textContent}`;
            })
            .join('\n');

        if (!conversationContext.trim()) {
            throw new Error('Conversation is empty');
        }

        const systemPrompt = `You are a helpful assistant that creates concise, descriptive titles for conversations.
Your task is to analyze the conversation and generate a short title (3-7 words) that captures the main topic or question.
Rules:
- Be specific and descriptive
- Use the language of the conversation (Russian or English)
- Focus on the main topic or question
- Keep it concise (3-7 words)
- Don't use quotes or special formatting
- Don't add prefixes like "Question about", "Problem with", "How to"
- Just return the title, nothing else

Examples:
user: How do I create a new table in YTsaurus?
assistant: Creating tables in YTsaurus

user: Почему операция зависла?
assistant: Зависшая операция

user: What's the difference between static and dynamic tables?
assistant: Static vs Dynamic tables`;

        const userPrompt = `Create a short title for this conversation:\n\n${conversationContext}`;

        const response = await axios.request({
            url: '/v1/responses',
            baseURL: this.config.baseUrl,
            method: 'POST',
            data: {
                model: this.config.model,
                metadata: {
                    agent: 'qt',
                },
                input: [
                    {
                        content: [
                            {
                                text: systemPrompt,
                                type: 'input_text',
                            },
                        ],
                        id: `msg_system_${Date.now()}`,
                        role: 'user',
                        status: 'completed',
                        type: 'message',
                    },
                    {
                        content: [
                            {
                                text: userPrompt,
                                type: 'input_text',
                            },
                        ],
                        id: `msg_user_${Date.now()}`,
                        role: 'user',
                        status: 'completed',
                        type: 'message',
                    },
                ],
            },
            headers: this.getRequestHeaders(req),
        });

        const generatedTitle = response.data.output?.[0]?.content?.[0]?.text?.trim();

        if (!generatedTitle) {
            throw new Error('Failed to generate title. Empty response');
        }

        await axios.request({
            url: `/v1/conversations/${conversationId}`,
            baseURL: this.config.baseUrl,
            method: 'POST',
            data: {
                metadata: {
                    topic: generatedTitle,
                },
            },
            headers: this.getRequestHeaders(req),
            responseType: 'stream',
        });

        return generatedTitle;
    }

    private getRequestHeaders(req: Request): Record<string, string> {
        const authHeaders = serverFactory.getAuthHeaders('aiChat', req) || {};
        return {
            ...authHeaders,
            'Content-Type': 'application/json',
        };
    }
}
