import {type Request, type Response} from '@gravity-ui/expresskit';
import {AiChat} from '../components/ai-chat';
import serverFactory from '../ServerFactory';
import {type SendMessageRequest} from '../types/ai-chat';
import {ErrorWithCode} from '../utils';
import {sendApiError} from '../utils/sendApiError';
import {type YTCoreConfig} from '../../@types/core';

const ERROR_MESSAGE = {
    CONFIG_NOT_SET: 'AI Chat configuration is not set in UI settings',
    CONFIG_INVALID: 'AI Chat configuration is invalid: missing required fields',
    FAILED_GET_MODELS: 'Failed to get models',
    FAILED_CREATE_CONVERSATION: 'Failed to create conversation',
    FAILED_GET_CONVERSATIONS: 'Failed to get conversations',
    FAILED_GET_CONVERSATION_ITEMS: 'Failed to get conversation items',
    FAILED_DELETE_CONVERSATION: 'Failed to delete conversation',
    FAILED_UPDATE_CONVERSATION_TITLE: 'Failed to update conversation title',
    FAILED_SEND_MESSAGE: 'Failed to send message',
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
    return new AiChat(config, serverFactory.getAuthHeaders('aiChat', req));
};

export const sendMessage = async (req: Request, res: Response) => {
    const controller = new AbortController();
    let responseFinished = false;
    const onClose = () => controller.abort();
    res.on('close', onClose);

    try {
        const aiChat = getAiChatInstance(req);
        const {input, conversation, metadata, model} = req.body as SendMessageRequest;
        if (typeof conversation !== 'string' || !conversation) {
            throw new ErrorWithCode(400, 'Conversation ID is required');
        }
        if (model !== undefined && (typeof model !== 'string' || !model.trim())) {
            throw new ErrorWithCode(400, 'Model must be a non-empty string');
        }
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();

        const response = await aiChat.sendMessage(
            {input, conversation, metadata, model},
            controller.signal,
        );

        if (controller.signal.aborted) return;

        let forwardChunk = false;
        response.onEventChunk((event) => {
            forwardChunk = !controller.signal.aborted && event.type !== 'response.output_text.done';
            if (
                ['response.completed', 'response.failed', 'response.incomplete'].includes(
                    event.type,
                )
            ) {
                responseFinished = true;
                response.abort();
            }
        });
        response.onBufferChunk((chunk) => {
            if (forwardChunk) res.write(chunk);
        });
        // Await start so stream errors reach the SSE error handler and cleanup below.
        await response.start();
    } catch (e) {
        if (controller.signal.aborted || responseFinished) return;
        req.ctx.logError(ERROR_MESSAGE.FAILED_SEND_MESSAGE, e);

        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({type: 'error', error: (e as Error).message})}\n\n`);
        } else {
            sendApiError(res, e);
        }
    } finally {
        res.off('close', onClose);
        controller.abort();
        if (!res.destroyed && !res.writableEnded) {
            if (res.headersSent) res.write('data: [DONE]\n\n');
            res.end();
        }
    }
};

export const getModels = async (req: Request, res: Response) => {
    try {
        const {data} = await getAiChatInstance(req).getModels();
        res.json({data: data.map(({id}) => ({id}))});
    } catch (error) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_GET_MODELS, error);
        sendApiError(res, error);
    }
};

export const createConversation = async (req: Request, res: Response) => {
    try {
        const topic = typeof req.body?.topic === 'string' ? req.body.topic.slice(0, 100) : '';
        res.json(await getAiChatInstance(req).createConversation({topic}));
    } catch (error) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_CREATE_CONVERSATION, error);
        sendApiError(res, error);
    }
};

export const getConversationItems = async (req: Request, res: Response) => {
    try {
        const after = typeof req.query.after === 'string' ? req.query.after : undefined;
        const page = await getAiChatInstance(req).getConversationItems(
            req.params.conversationId,
            after,
        );
        res.json({data: page.data, has_more: page.has_more, last_id: page.last_id});
    } catch (error) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_GET_CONVERSATION_ITEMS, error);
        sendApiError(res, error);
    }
};

export const deleteConversation = async (req: Request, res: Response) => {
    try {
        res.json(await getAiChatInstance(req).deleteConversation(req.params.conversationId));
    } catch (error) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_DELETE_CONVERSATION, error);
        sendApiError(res, error);
    }
};

export const summarizeConversationTitle = async (req: Request, res: Response) => {
    try {
        const title = await getAiChatInstance(req).summarizeConversationTitle(
            req.params.conversationId,
            req.body?.metadata,
        );
        res.json({title});
    } catch (error) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_UPDATE_CONVERSATION_TITLE, error);
        sendApiError(res, error);
    }
};

export const getConversations = async (req: Request, res: Response) => {
    try {
        const after = typeof req.query.after === 'string' ? req.query.after : undefined;
        res.json(await getAiChatInstance(req).getConversations(after));
    } catch (error) {
        req.ctx.logError(ERROR_MESSAGE.FAILED_GET_CONVERSATIONS, error);
        sendApiError(res, error);
    }
};
