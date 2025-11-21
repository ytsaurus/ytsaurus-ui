import {
    ChatAnswer,
    ChatMessage,
    SearchMcpAnswer,
    SearchMcpResponse,
    TableSchemaMcpAnswer,
    UnknownMcpAnswer,
} from '../../../types/ai-chat';
import {GetConversationItemsResponse, LLMStreamEvent} from '../../../../shared/ai-chat';

export const parseStreamLine = (line: string): LLMStreamEvent | {text: string} | null => {
    if (!line.startsWith('data: ') || line === 'data: [DONE]') {
        return null;
    }

    try {
        return JSON.parse(line.substring(6));
    } catch (e) {
        return null;
    }
};

export const getTextDelta = (event: LLMStreamEvent | {text: string}): string | null => {
    if ('text' in event) {
        return event.text;
    }

    if ('type' in event && event.type === 'response.output_text.delta' && event.delta) {
        return event.delta;
    }

    return null;
};

export const createMcpItem = (
    item: NonNullable<LLMStreamEvent['item']>,
): SearchMcpAnswer | TableSchemaMcpAnswer | UnknownMcpAnswer | undefined => {
    if (item.type !== 'mcp_call') return undefined;

    if (item.name === 'search_docs' && item.output) {
        try {
            const output: SearchMcpResponse = JSON.parse(item.output);
            const result = output.response?.result;
            if (result && Array.isArray(result)) {
                return {
                    id: item.id,
                    type: 'mcp_search_answer',
                    value: result,
                };
            }
        } catch (e) {}
    }

    if (item.name === 'get_table_schema' && item.output) {
        return {
            id: item.id,
            type: 'mcp_table_schema_answer',
            value: item.output,
        };
    }

    return {
        id: item.id,
        type: 'mcp_unknown_answer',
        name: item.name || 'unknown',
        value: item,
    };
};

export const createMessageItem = (
    item: NonNullable<LLMStreamEvent['item']>,
    fullText: string,
): ChatAnswer | undefined => {
    if (item.type !== 'message') return undefined;

    return {
        id: item.id,
        type: 'answer',
        state: 'done',
        value: fullText,
    };
};

const SPECIAL_TAGS = [
    '<user_message>',
    '<query>',
    '<error>',
    '<warning>',
    '<info>',
    '<library>',
    '<rag_context>',
];

export const parseConversationItems = (
    data: GetConversationItemsResponse['data'],
): ChatMessage[] => {
    return data.reduce<ChatMessage[]>((acc, item) => {
        if (item.type === 'mcp_call') {
            if (item.name === 'search_docs') {
                try {
                    const output: SearchMcpResponse = JSON.parse(item.output);
                    const result = output.response?.result;
                    if (result && Array.isArray(result)) {
                        acc.push({
                            id: item.id,
                            type: 'mcp_search_answer',
                            value: result,
                        });
                        return acc;
                    }
                } catch (e) {}
            }

            if (item.name === 'get_table_schema') {
                acc.push({
                    id: item.id,
                    type: 'mcp_table_schema_answer',
                    value: item.output,
                });
                return acc;
            }

            acc.push({
                id: item.id,
                type: 'mcp_unknown_answer',
                name: item.name,
                value: item,
            });

            return acc;
        }

        if (SPECIAL_TAGS.some((tag) => item.content[0].text.startsWith(tag))) return acc;

        if (item.role === 'user') {
            acc.push({
                id: item.id,
                type: 'question',
                value: item.content[0].text,
            });
        } else {
            acc.push({
                id: item.id,
                type: 'answer',
                state: 'done',
                value: item.content[0].text,
            });
        }
        return acc;
    }, []);
};
