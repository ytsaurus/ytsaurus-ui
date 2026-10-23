import {type OpenAIResponseLike, openAIResponseToMessages} from '@gravity-ui/aikit/adapters';
import {type TChatMessage} from '@gravity-ui/aikit';
import {type ConversationItem} from '../../../../shared/ai-chat';

export function getMessageText(content: unknown): string {
    if (!Array.isArray(content)) return '';
    return content
        .map((part: unknown) => {
            if (!part || typeof part !== 'object') return '';
            if ('text' in part && typeof part.text === 'string') return part.text;
            if ('refusal' in part && typeof part.refusal === 'string') return part.refusal;
            return '';
        })
        .join('');
}

const CONTEXT_TAGS = ['<query>', '<error>', '<warning>', '<info>', '<library>', '<rag_context>'];

export function parseConversationItems(items: ConversationItem[]): TChatMessage[] {
    return items.flatMap((item): TChatMessage[] => {
        if (item.type === 'message' && item.role === 'user') {
            const content = item.content?.filter(
                (part) => !CONTEXT_TAGS.some((tag) => getMessageText([part]).startsWith(tag)),
            );
            const text = getMessageText(content);
            return text ? [{id: item.id, role: 'user', content: text}] : [];
        }
        if (item.type === 'message' && item.role !== 'assistant') return [];
        // Map stored items independently to preserve pagination IDs and ordering.
        return openAIResponseToMessages({
            id: item.id,
            output: [item] as NonNullable<OpenAIResponseLike['output']>,
        }).filter((message) => message.content !== '');
    });
}
