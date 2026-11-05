import {type ResponseInput} from 'openai/resources/responses/responses';

export interface SendMessageRequest {
    input: ResponseInput;
    conversation: string;
    metadata?: Record<string, string>;
}
