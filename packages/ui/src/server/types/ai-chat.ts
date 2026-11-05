import {type ResponseInput} from 'openai/resources/responses/responses';

export interface SendMessageRequest {
    input: ResponseInput;
    model?: string;
    conversation: string;
    metadata?: Record<string, string>;
}
