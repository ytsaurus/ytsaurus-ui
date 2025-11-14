import {ThunkAction} from 'redux-thunk';
import {Action} from 'redux';
import {RootState} from '../../reducers';
import {
    selectAiChatModel,
    selectAttachedFiles,
    selectChatMode,
    selectChatOpen,
    selectChatQuestion,
    selectConversationId,
    selectConversationItems,
    selectConversations,
} from '../../selectors/ai/chat';
import {getQueryDraft} from '../../selectors/query-tracker/query';
import {
    addItem,
    clearAttachedFiles,
    clearCurrentAnswer,
    resetChart,
    setConversationId,
    setConversations,
    setCurrentAnswer,
    setError,
    setIsOpen,
    setItems,
    setLoading,
    setMode,
    setQuestion,
    setSending,
} from '../../reducers/ai/chatSlice';
import {ChatError, ChatMessage, SearchMcpResponse} from '../../../types/ai-chat';
import axios from 'axios';
import {type Conversation, GetConversationItemsResponse} from '../../../../shared/ai-chat';
import {createMcpItem, createMessageItem, getTextDelta, parseStreamLine} from './helpers';

const BASE_PATH = '/api/code-assistant';
type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const META = {
    agent: 'qt',
};

const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                resolve(result);
            } else {
                reject(new Error('Failed to read file as text'));
            }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
};

const ERROR_MESSAGE = {
    HTTP_ERROR: 'HTTP error! status:',
    RESPONSE_NOT_READABLE: 'Response body is not readable',
};

let currentAbortController: AbortController | null = null;

async function* streamAsyncIterator(
    reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<Uint8Array, void, unknown> {
    try {
        while (true) {
            const {done, value} = await reader.read();
            if (done) return;
            yield value;
        }
    } finally {
        reader.releaseLock();
    }
}

const prepareQueryContext = (state: RootState): string[] => {
    const isQueriesPage = window.location.pathname.includes('/queries');

    if (!isQueriesPage) {
        return [];
    }

    const draft = getQueryDraft(state);
    const contextMessages: string[] = [];

    if (draft.query && draft.query.trim()) {
        contextMessages.push(`<query>\n${draft.query}\n</query>`);
    }

    if (draft.error) {
        const errorText =
            typeof draft.error === 'string' ? draft.error : JSON.stringify(draft.error, null, 2);
        contextMessages.push(`<error>\n${errorText}\n</error>`);
    }

    return contextMessages;
};

export const summarizeConversationTitle =
    (conversationId: string): AsyncAction =>
    async (dispatch, getState) => {
        const conversations = selectConversations(getState());

        try {
            const response = await axios.post<{title: string}>(
                `${BASE_PATH}/conversations/${conversationId}/summarize-title`,
            );
            const newConversations = conversations.map((conversation) => {
                if (conversation.id === conversationId) {
                    return {
                        ...conversation,
                        metadata: {
                            ...conversation.metadata,
                            topic: response.data.title,
                        },
                    };
                }
                return conversation;
            });

            dispatch(setConversations(newConversations));
        } catch (e) {}
    };

const TITLE_GENERATION_FREQUENCY = 5;
const DEFAULT_CONVERSATION_TITLE = 'новый чат';

export const sendQuestion = (): AsyncAction => async (dispatch, getState) => {
    const processStreamLine = (line: string, fullText: string): string => {
        const event = parseStreamLine(line);
        if (!event) return fullText;

        const delta = getTextDelta(event);
        if (delta) {
            const newFullText = fullText + delta;
            dispatch(setCurrentAnswer(newFullText));
            return newFullText;
        }

        if ('type' in event && event.type === 'response.output_item.done' && event.item) {
            const messageItem = createMessageItem(event.item, fullText);
            if (messageItem) {
                dispatch(addItem(messageItem));
                dispatch(clearCurrentAnswer());
                return '';
            }

            const mcpItem = createMcpItem(event.item);
            if (mcpItem) {
                dispatch(addItem(mcpItem));
            }
        }

        return fullText;
    };

    const state = getState();
    const question = selectChatQuestion(state);
    const conversationId = selectConversationId(state);
    const conversations = selectConversations(state);
    const attachedFiles = selectAttachedFiles(state);
    const model = selectAiChatModel();
    let summarize = false;

    if (!question) return;

    const contextMessages = prepareQueryContext(state);

    dispatch(setMode('chat'));
    dispatch(
        addItem({
            id: '',
            type: 'question',
            value: question,
        }),
    );
    dispatch(setQuestion(undefined));
    dispatch(setSending(true));

    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;

    try {
        let currentConversationId = conversationId;
        if (!currentConversationId) {
            const {data} = await axios.post<Conversation>(`${BASE_PATH}/create-conversation`, {
                model,
                metadata: {...META, topic: DEFAULT_CONVERSATION_TITLE},
            });
            currentConversationId = data.id;
            dispatch(setConversations([...conversations, data]));
            summarize = true;
        }

        // Read file contents
        const files = await Promise.all(
            attachedFiles.map(async (file) => ({
                name: file.name,
                type: file.type,
                content: await readFileAsText(file),
            })),
        );

        if (currentAbortController) {
            currentAbortController.abort();
        }
        currentAbortController = new AbortController();
        const response = await fetch(`${BASE_PATH}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: question,
                model,
                metadata: META,
                conversationId: currentConversationId,
                contextMessages: contextMessages.length > 0 ? contextMessages : undefined,
                files: files.length > 0 ? files : undefined,
            }),
            signal: currentAbortController.signal,
        });

        if (!response.ok) {
            throw new Error(`${ERROR_MESSAGE.HTTP_ERROR} ${response.status}`);
        }

        reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
            throw new Error(ERROR_MESSAGE.RESPONSE_NOT_READABLE);
        }

        let buffer = '';
        let fullText = '';

        for await (const chunk of streamAsyncIterator(reader)) {
            const decodedChunk = decoder.decode(chunk, {stream: true});
            buffer += decodedChunk;
            const lines = buffer.split('\n');

            for (let i = 0; i < lines.length - 1; i++) {
                const line = lines[i].trim();
                fullText = processStreamLine(line, fullText);
            }

            buffer = lines[lines.length - 1];
        }

        const itemsCount = selectConversationItems(getState()).length;
        if (itemsCount > 0 && !(itemsCount % TITLE_GENERATION_FREQUENCY)) {
            summarize = true;
        }

        dispatch(setConversationId(currentConversationId));
        if (summarize) {
            dispatch(summarizeConversationTitle(currentConversationId));
        }

        dispatch(clearAttachedFiles());
    } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') {
            dispatch(setSending(false));
            return;
        }

        const error: ChatError = {
            type: 'error',
            error: e as Error,
        };
        dispatch(addItem(error));
    } finally {
        dispatch(setSending(false));
        currentAbortController = null;
    }
};

export const createConversationWithPrompt =
    (prompt: string): AsyncAction =>
    (dispatch) => {
        dispatch(resetChart());
        dispatch(setQuestion(prompt));
        dispatch(setIsOpen(true));
        dispatch(sendQuestion());
    };

export const getConversations = (): AsyncAction => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get(`${BASE_PATH}/conversations`);

        dispatch(setConversations(response.data.data));
    } catch (e) {
        dispatch(setError(e as Error));
    } finally {
        dispatch(setLoading(false));
    }
};

export const toggleChatHistory = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const currentMode = selectChatMode(state);
    const nextMode = currentMode === 'chat' ? 'history' : 'chat';

    if (nextMode === 'history') {
        dispatch(getConversations());
    }
    dispatch(setMode(nextMode));
};

export const deleteConversation =
    (conversationId: string): AsyncAction =>
    async (dispatch, getState) => {
        try {
            const conversations = selectConversations(getState());
            await axios.delete(`${BASE_PATH}/conversations/${conversationId}`);

            dispatch(
                setConversations(
                    conversations.filter((conversation) => conversation.id !== conversationId),
                ),
            );
        } catch (e) {
            dispatch(setError(e as Error));
        }
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

export const loadConversation =
    (conversationId: string): AsyncAction =>
    async (dispatch, getState) => {
        const currentConversationId = selectConversationId(getState());

        if (currentConversationId === conversationId) {
            dispatch(setMode('chat'));
            return;
        }

        dispatch(setConversationId(conversationId));
        dispatch(setItems([]));
        dispatch(setLoading(true));
        dispatch(setMode('chat'));

        try {
            const response = await axios.get<GetConversationItemsResponse>(
                `${BASE_PATH}/conversations/${conversationId}/items`,
                {
                    params: {
                        order: 'asc',
                        limit: 100,
                    },
                },
            );

            const items = response.data.data.reduce<ChatMessage[]>((acc, item) => {
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

            dispatch(setItems(items));
        } catch (e) {
            dispatch(setError(e as Error));
        } finally {
            dispatch(setLoading(false));
        }
    };

export const toggleChatSidePanel = (): AsyncAction => (dispatch, getState) => {
    const open = selectChatOpen(getState());
    dispatch(setIsOpen(!open));
};
