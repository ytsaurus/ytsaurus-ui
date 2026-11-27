import {type ResponseStream} from '@gravity-ui/aikit/server/openai';
import {type Response} from '@gravity-ui/expresskit';

const HEARTBEAT_INTERVAL_MS = 15_000;

export async function sendResponseStream(
    res: Response,
    createStream: (signal: AbortSignal) => Promise<ResponseStream>,
) {
    const controller = new AbortController();
    let responseFinished = false;
    let heartbeat: ReturnType<typeof setInterval> | undefined;
    const onClose = () => {
        clearInterval(heartbeat);
        controller.abort();
    };
    res.on('close', onClose);

    try {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders();
        // Keep proxies alive while the backend is preparing or streaming a response.
        heartbeat = setInterval(() => {
            if (!res.destroyed && !res.writableEnded) res.write(': ping\n\n');
        }, HEARTBEAT_INTERVAL_MS);

        const response = await createStream(controller.signal);
        if (controller.signal.aborted) return;

        response.onEventChunk((event) => {
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
            if (!controller.signal.aborted) res.write(chunk);
        });
        // Await start so stream errors reach the SSE error handler and cleanup below.
        await response.start();
    } catch (error) {
        if (controller.signal.aborted || responseFinished) return;
        if (res.headersSent) {
            res.write(
                `data: ${JSON.stringify({type: 'error', error: (error as Error).message})}\n\n`,
            );
        }
        // The controller logs the error and handles failures before SSE headers were sent.
        throw error;
    } finally {
        clearInterval(heartbeat);
        res.off('close', onClose);
        controller.abort();
        if (res.headersSent && !res.destroyed && !res.writableEnded) {
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }
}
