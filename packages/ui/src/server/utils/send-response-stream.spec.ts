import {PassThrough} from 'node:stream';
import {type Response} from '@gravity-ui/expresskit';
import {ResponseStream} from '@gravity-ui/aikit/server/openai';
import {Stream} from 'openai/streaming';
import {type ResponseStreamEvent} from 'openai/resources/responses/responses';
import {sendResponseStream} from './send-response-stream';

function makeResponse() {
    const chunks: string[] = [];
    const response = Object.assign(new PassThrough(), {
        headersSent: false,
        setHeader: jest.fn(),
        flushHeaders() {
            this.headersSent = true;
        },
    });
    response.on('data', (chunk) => chunks.push(String(chunk)));
    return {res: response as unknown as Response, body: () => chunks.join('')};
}

describe('sendResponseStream', () => {
    it('delivers the terminal event before closing the connection', async () => {
        const {res, body} = makeResponse();
        const delta = {type: 'response.output_text.delta', delta: 'Answer'} as ResponseStreamEvent;
        const terminal = {type: 'response.completed'} as ResponseStreamEvent;
        const stream = new ResponseStream(
            new Stream(async function* () {
                yield delta;
                yield terminal;
                yield {
                    type: 'response.output_text.delta',
                    delta: 'Must not be forwarded',
                } as ResponseStreamEvent;
            }, new AbortController()),
        );

        await sendResponseStream(res, async () => stream);

        expect(body()).toBe(
            `data: ${JSON.stringify(delta)}\n\ndata: ${JSON.stringify(terminal)}\n\ndata: [DONE]\n\n`,
        );
        expect(res.writableEnded).toBe(true);
    });

    it('cancels a pending backend request when the client disconnects', async () => {
        const {res, body} = makeResponse();
        let signal!: AbortSignal;
        const result = sendResponseStream(res, (requestSignal) => {
            signal = requestSignal;
            return new Promise((_resolve, reject) => {
                signal.addEventListener('abort', () => reject(new Error('aborted')), {once: true});
            });
        });

        res.destroy();
        await result;

        expect(signal.aborted).toBe(true);
        expect(body()).toBe('');
    });
});
