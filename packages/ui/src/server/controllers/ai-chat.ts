import {Request, Response} from '@gravity-ui/expresskit';
import {AiChat} from '../components/ai-chat';
import {LLMStreamEvent} from '../../shared/ai-chat';
import {CreateConversationRequest, SendMessageRequest} from '../types/ai-chat';
import {ErrorWithCode, pipeAxiosResponse} from '../utils';
import {sendApiError} from '../utils/sendApiError';
import {YTCoreConfig} from '../../@types/core';
import {Readable} from 'stream';

const ERROR_MESSAGE = {
    CONFIG_NOT_SET: 'AI Chat configuration is not set in UI settings',
    CONFIG_INVALID: 'AI Chat configuration is invalid: missing required fields',
    FAILED_CREATE_CONVERSATION: 'Failed to create conversation',
    FAILED_GET_CONVERSATIONS: 'Failed to get conversations',
    FAILED_GET_CONVERSATION_ITEMS: 'Failed to get conversation items',
    STREAM_ERROR: 'Stream error:',
    FAILED_SEND_MESSAGE: 'Failed to send message',
    FAILED_DELETE_CONVERSATION: 'Failed to delete conversation',
    FAILED_UPDATE_CONVERSATION_TITLE: 'Failed to update conversation title',
};

const getAiChatConfiguration = (req: Request) => {
    const config = req.ctx.config as YTCoreConfig;
    const aiChatConfig = config.uiSettings?.aiChatConfig;

    if (!aiChatConfig) {
        throw new ErrorWithCode(500, ERROR_MESSAGE.CONFIG_NOT_SET);
    }

    if (!aiChatConfig.baseUrl || !aiChatConfig.model) {
        throw new ErrorWithCode(500, ERROR_MESSAGE.CONFIG_INVALID);
    }

    return aiChatConfig;
};

const getAiChatInstance = (req: Request) => {
    const config = getAiChatConfiguration(req);
    return new AiChat(config);
};

export const createConversation = async (req: Request, res: Response) => {
    try {
        const aiChat = getAiChatInstance(req);
        const requestData = req.body as CreateConversationRequest;
        const response = await aiChat.createConversation(requestData, req);
        await pipeAxiosResponse(req.ctx, res, response);
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_CREATE_CONVERSATION, e);
        sendApiError(res, e);
    }
};

export const getConversations = async (req: Request, res: Response) => {
    try {
        const aiChat = getAiChatInstance(req);
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        const after = req.query.after as string | undefined;

        const response = await aiChat.getConversations(limit, after, req);
        await pipeAxiosResponse(req.ctx, res, response);
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_GET_CONVERSATIONS, e);
        sendApiError(res, e);
    }
};

export const getConversationItems = async (req: Request, res: Response) => {
    try {
        const aiChat = getAiChatInstance(req);
        const {conversationId} = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
        const after = req.query.after as string | undefined;
        const order = (req.query.order as 'asc' | 'desc') || 'desc';

        const response = await aiChat.getConversationItems(
            conversationId,
            limit,
            after,
            order,
            req,
        );
        await pipeAxiosResponse(req.ctx, res, response);
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_GET_CONVERSATION_ITEMS, e);
        sendApiError(res, e);
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    let streamClosed = false;
    let headersAlreadySent = false;
    let response: Readable | null = null;

    let onData: ((chunk: Buffer) => void) | null = null;
    let onEnd: (() => void) | null = null;
    let onError: ((e: Error) => void) | null = null;
    let onReqClose: (() => void) | null = null;

    const cleanup = () => {
        if (response) {
            if (onData) response.removeListener('data', onData);
            if (onEnd) response.removeListener('end', onEnd);
            if (onError) response.removeListener('error', onError);
        }
        if (onReqClose) req.removeListener('close', onReqClose);
    };

    const closeStream = () => {
        if (!streamClosed) {
            streamClosed = true;
            cleanup();
            if (!res.writableEnded) {
                res.end();
            }
        }
    };

    try {
        const aiChat = getAiChatInstance(req);
        const {message, metadata, model, conversationId, contextMessages, files} = req.body as {
            model: string;
            message: string;
            conversationId: string;
            metadata?: Record<string, unknown>;
            contextMessages?: string[];
            files?: {name: string; content: string; type: string}[];
        };

        const requestData: SendMessageRequest = {
            model,
            conversationId: conversationId,
            message,
            metadata,
            contextMessages: contextMessages,
            files,
        };

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        headersAlreadySent = true;

        response = await aiChat.sendMessage(requestData, req);

        let lastTail = '';

        onData = (chunk: Buffer) => {
            if (streamClosed) {
                return;
            }

            const chunkString = lastTail + chunk.toString();
            const lines = chunkString.split('\n');
            lastTail = lines.pop() || '';

            for (const line of lines) {
                const trimmedLine = line.trim();

                if (!trimmedLine) {
                    continue;
                }

                if (trimmedLine.startsWith('data: ')) {
                    const dataContent = trimmedLine.substring(6);

                    if (dataContent === '[DONE]') {
                        continue;
                    }

                    try {
                        const data: LLMStreamEvent = JSON.parse(dataContent);

                        if (data.type === 'response.output_text.delta' && data.delta) {
                            res.write(`data: ${JSON.stringify({text: data.delta})}\n\n`);
                        } else {
                            if (data.type === 'response.output_text.done') continue;
                            res.write(`data: ${JSON.stringify(data)}\n\n`);
                        }

                        if (data.type === 'response.done' || data.type === 'response.failed') {
                            res.write('data: [DONE]\n\n');
                            closeStream();
                            return;
                        }
                    } catch (e) {
                        req.ctx.logError('Failed to parse SSE data:', e);
                    }
                }
            }
        };

        onEnd = () => {
            if (!streamClosed) {
                res.write('data: [DONE]\n\n');
            }
            closeStream();
        };

        onError = (e: Error) => {
            if (!streamClosed) {
                req.ctx.logError(ERROR_MESSAGE.STREAM_ERROR, e);

                try {
                    res.write(`data: ${JSON.stringify({type: 'error', error: e.message})}\n\n`);
                    res.write('data: [DONE]\n\n');
                } catch (writeError) {
                    req.ctx.logError('Failed to write error to stream:', writeError);
                }
            }
            closeStream();
        };

        onReqClose = () => {
            if (!streamClosed) {
                req.ctx.logError('Client disconnected');
                response?.destroy();
                closeStream();
            }
        };

        response?.on('data', onData);
        response?.on('end', onEnd);
        response?.on('error', onError);
        req.on('close', onReqClose);
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_SEND_MESSAGE, e);

        if (headersAlreadySent && !streamClosed) {
            try {
                res.write(
                    `data: ${JSON.stringify({type: 'error', error: (e as Error).message})}\n\n`,
                );
                res.write('data: [DONE]\n\n');
            } catch (writeError) {
                req.ctx.logError('Failed to write error to stream:', writeError);
            }
            closeStream();
        } else if (!headersAlreadySent) {
            sendApiError(res, e);
        }
    }
};

export const deleteConversation = async (req: Request, res: Response) => {
    try {
        const aiChat = getAiChatInstance(req);
        const {conversationId} = req.params;
        const response = await aiChat.deleteConversation(conversationId, req);
        await pipeAxiosResponse(req.ctx, res, response);
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_DELETE_CONVERSATION, e);
        sendApiError(res, e);
    }
};

export const summarizeConversationTitle = async (req: Request, res: Response) => {
    try {
        const aiChat = getAiChatInstance(req);
        const {conversationId} = req.params;
        const title = await aiChat.summarizeConversationTitle(conversationId, req);
        res.status(200).json({success: true, title});
    } catch (e) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_UPDATE_CONVERSATION_TITLE, e);
        sendApiError(res, e);
    }
};
