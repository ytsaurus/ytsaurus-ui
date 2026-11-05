import {EventEmitter} from 'events';
import {type Response} from '@gravity-ui/expresskit';
import {type ResponseStream} from '@gravity-ui/aikit/server/openai';
import {sendResponseStream} from './send-response-stream';

function makeResponse() {
    return Object.assign(new EventEmitter(), {
        headersSent: false,
        destroyed: false,
        writableEnded: false,
        setHeader: jest.fn(),
        flushHeaders() {
            this.headersSent = true;
        },
        write: jest.fn(),
        end: jest.fn(),
    });
}

function makeStream(start: () => Promise<void>) {
    return {
        onEventChunk: jest.fn(),
        onBufferChunk: jest.fn(),
        start,
    } as unknown as ResponseStream;
}

describe('sendResponseStream', () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it('keeps the connection alive before headers from the backend and during streaming', async () => {
        const res = makeResponse();
        let resolveStream!: (stream: ResponseStream) => void;
        let finish!: () => void;
        const stream = makeStream(
            () =>
                new Promise<void>((resolve) => {
                    finish = resolve;
                }),
        );
        const result = sendResponseStream(
            res as unknown as Response,
            () =>
                new Promise<ResponseStream>((resolve) => {
                    resolveStream = resolve;
                }),
        );

        jest.advanceTimersByTime(75_000);
        expect(res.write).toHaveBeenCalledTimes(5);
        expect(res.write).toHaveBeenLastCalledWith(': ping\n\n');
        resolveStream(stream);
        await Promise.resolve();
        jest.advanceTimersByTime(15_000);
        expect(res.write).toHaveBeenCalledTimes(6);
        finish();
        await result;
        expect(res.write).toHaveBeenLastCalledWith('data: [DONE]\n\n');
        expect(res.end).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
    });

    it('cancels the backend and stops heartbeats when the client disconnects', async () => {
        const res = makeResponse();
        let signal!: AbortSignal;
        const result = sendResponseStream(res as unknown as Response, (requestSignal) => {
            signal = requestSignal;
            return new Promise((_resolve, reject) => {
                signal.addEventListener('abort', () => reject(new Error('aborted')), {once: true});
            });
        });
        res.destroyed = true;
        res.emit('close');
        await result;
        jest.advanceTimersByTime(60_000);
        expect(signal.aborted).toBe(true);
        expect(res.write).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });

    it('reports backend errors and clears the heartbeat', async () => {
        const res = makeResponse();
        const result = sendResponseStream(res as unknown as Response, async () => {
            throw new Error('backend unavailable');
        });
        await expect(result).rejects.toThrow('backend unavailable');
        expect(res.write).toHaveBeenCalledWith(
            'data: {"type":"error","error":"backend unavailable"}\n\n',
        );
        expect(res.end).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
    });
});
