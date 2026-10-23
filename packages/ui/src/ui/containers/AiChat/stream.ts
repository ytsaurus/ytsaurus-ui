import {type OpenAIStreamEventLike, fetchResponseToStreamEvents} from '@gravity-ui/aikit/adapters';
import i18n from './i18n';

// Compatibility guard for AIKit 2.25: its fetch adapter treats EOF as response.done,
// even if generation was interrupted, and does not classify failed/incomplete
// responses as errors. Remove when those cases are handled by AIKit.
// Event interpretation and message construction remain entirely in AIKit.
export async function* responseEvents(response: Response): AsyncIterable<OpenAIStreamEventLike> {
    let terminal = false;
    for await (const event of fetchResponseToStreamEvents(response)) {
        const type = 'type' in event ? event.type : undefined;
        if (
            ['response.completed', 'response.failed', 'response.incomplete', 'error'].includes(
                typeof type === 'string' ? type : '',
            )
        ) {
            terminal = true;
        }
        if (type === 'response.failed' || type === 'response.incomplete') {
            const result = ('response' in event ? event.response : undefined) as
                {error?: {message?: string}} | undefined;
            throw new Error(
                result?.error?.message ||
                    i18n(
                        type === 'response.incomplete'
                            ? 'alert_response-incomplete'
                            : 'alert_response-failed',
                    ),
            );
        }
        if (type === 'response.done' && !terminal) {
            throw new Error(i18n('alert_response-interrupted'));
        }
        yield event;
    }
    if (!terminal) throw new Error(i18n('alert_response-interrupted'));
}
