import {Request, Response} from '@gravity-ui/expresskit';
import {AiChat} from '../components/ai-chat';
import {ChatTelemetry, HistoryMessage, StreamData} from '../../shared/ai-chat';

const codeAssistant = new AiChat('https://code-assist.yandex.net');

export const sendQuestion = async (req: Request, res: Response) => {
    try {
        const requestId = req.ctx.getMetadata()['x-request-id'];
        const {question, history, query, problems} = req.body as {
            question: string;
            history: HistoryMessage[];
            query: string;
            problems: string;
        };

        const data = await codeAssistant.sendQuestion(req, {
            requestId,
            question,
            history,
            query,
            problems,
        });
        res.status(200).json(data);
    } catch (e) {
        req.ctx.logError('Failed to send code assistant question', e);
        res.status(500).send(e);
    }
};

export const getChatStream = async (req: Request, res: Response) => {
    try {
        const {id, offset} = req.body as StreamData;

        const data = await codeAssistant.getChatStreaming(req, {id, offset});
        res.status(200).json(data);
    } catch (e) {
        req.ctx.logError('Failed to get code assistant stream data', e);
        res.status(500).send(e);
    }
};

export const sendChatTelemetry = async (req: Request, res: Response) => {
    const requestId = req.ctx.getMetadata()['x-request-id'];
    const event = req.body.event as ChatTelemetry;

    try {
        await codeAssistant.sendChatTelemetry(req, {
            requestId,
            event,
        });

        res.status(200).json({success: true});
    } catch (e) {
        req.ctx.logError('Failed to send code assistant telemetry', e);
        res.status(500).send(e);
    }
};
