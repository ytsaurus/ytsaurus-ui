import {ThunkAction} from 'redux-thunk';
import {Action} from 'redux';
import {RootState} from '../../reducers';
import {
    selectAiChatModel,
    selectAttachedFiles,
    selectChatMode,
    selectChatOpen,
    selectChatQuestion,
    selectConversation,
    selectConversationId,
    selectConversations,
} from '../../selectors/ai/chat';
import {getQueryDraft, getQueryEngine} from '../../selectors/query-tracker/query';
import {
    addAttachedFile,
    addConversationItem,
    clearAttachedFiles,
    clearCurrentAnswer,
    resetChat,
    setConversation,
    setConversationId,
    setConversations,
    setCurrentAnswer,
    setError,
    setIsOpen,
    setLoading,
    setMode,
    setQuestion,
    setSending,
} from '../../reducers/ai/chatSlice';
import {ChatError} from '../../../types/ai-chat';
import axios from 'axios';
import {type Conversation, GetConversationItemsResponse} from '../../../../shared/ai-chat';
import {
    createMcpItem,
    createMessageItem,
    getTextDelta,
    parseConversationItems,
    parseStreamLine,
} from './helpers';
import {AGENT_MAP} from '../../../containers/AiChat/constants';

const BASE_PATH = '/api/code-assistant';
const DEFAULT_AGENT = 'qt';

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

const isQueriesPage = () => window.location.pathname.includes('/queries');

const getMeta = (state: RootState) => {
    if (!isQueriesPage()) {
        return {agent: DEFAULT_AGENT};
    }

    const engine = getQueryEngine(state);
    const agent = engine ? AGENT_MAP[engine] : DEFAULT_AGENT;

    return {agent};
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
    if (!isQueriesPage()) {
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
        const state = getState();
        const conversations = selectConversations(state);

        try {
            const response = await axios.post<{title: string}>(
                `${BASE_PATH}/conversations/${conversationId}/summarize-title`,
            );
            const newConversations = conversations.items.map((conversation) => {
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

            dispatch(setConversations({items: newConversations}));
        } catch (e) {}
    };

const TITLE_GENERATION_FREQUENCY = 5;
const DEFAULT_CONVERSATION_TITLE = 'новый чат';

export const sendQuestion =
    (promptId?: string): AsyncAction =>
    async (dispatch, getState) => {
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
                    dispatch(addConversationItem(messageItem));
                    dispatch(clearCurrentAnswer());
                    return '';
                }

                const mcpItem = createMcpItem(event.item);
                if (mcpItem) {
                    dispatch(addConversationItem(mcpItem));
                }
            }

            return fullText;
        };

        const state = getState();
        const question = selectChatQuestion(state) || '';
        const conversationId = selectConversationId(state);
        const {items, hasMore, lastId} = selectConversations(state);
        const attachedFiles = selectAttachedFiles(state);
        const model = selectAiChatModel();
        let summarize = false;

        if (!question && !promptId) return;

        const contextMessages = prepareQueryContext(state);

        dispatch(setMode('chat'));
        if (question) {
            dispatch(
                addConversationItem({
                    id: '',
                    type: 'question',
                    value: question,
                }),
            );
        }
        dispatch(setQuestion(undefined));
        dispatch(setSending(true));

        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
        try {
            let currentConversationId = conversationId;
            const meta = getMeta(state);
            if (!currentConversationId) {
                const {data} = await axios.post<Conversation>(`${BASE_PATH}/create-conversation`, {
                    model,
                    metadata: {...meta, topic: DEFAULT_CONVERSATION_TITLE},
                });
                currentConversationId = data.id;
                dispatch(
                    setConversations({items: [data, ...items], hasMore, lastId, loading: false}),
                );
                summarize = true;
            }

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
                    metadata: meta,
                    conversationId: currentConversationId,
                    promptId: promptId,
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

            const itemsCount = selectConversation(getState()).items.length;
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
                dispatch(clearCurrentAnswer());
                dispatch(setError(undefined));
                return;
            }

            const error: ChatError = {
                type: 'error',
                error: e as Error,
            };
            dispatch(addConversationItem(error));
        } finally {
            dispatch(setSending(false));
            currentAbortController = null;
        }
    };

export const createConversationWithPrompt =
    (promptId: string): AsyncAction =>
    (dispatch) => {
        dispatch(resetChat());
        dispatch(setIsOpen(true));
        dispatch(sendQuestion(promptId));
    };

const CONVERSATIONS_LIMIT = 20;

export const getConversations = (): AsyncAction => async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get(`${BASE_PATH}/conversations`, {
            params: {
                limit: CONVERSATIONS_LIMIT,
            },
        });

        dispatch(
            setConversations({
                items: response.data.data,
                hasMore: response.data.has_more,
                lastId: response.data.last_id,
                loading: false,
            }),
        );
    } catch (e) {
        dispatch(setError(e as Error));
    } finally {
        dispatch(setLoading(false));
    }
};

export const loadMoreConversations = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const conversations = selectConversations(state);
    const {items, hasMore, loading, lastId} = conversations;

    if (!hasMore || loading) {
        return;
    }

    dispatch(setConversations({loading: true}));
    try {
        const response = await axios.get(`${BASE_PATH}/conversations`, {
            params: {
                limit: CONVERSATIONS_LIMIT,
                after: lastId,
            },
        });

        dispatch(
            setConversations({
                items: [...items, ...response.data.data],
                hasMore: response.data.has_more,
                lastId: response.data.last_id,
                loading: false,
            }),
        );
    } catch (e) {
        dispatch(setConversations({loading: false}));
        dispatch(setError(e as Error));
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
            const state = getState();
            const {items, hasMore, lastId, loading} = selectConversations(state);
            await axios.delete(`${BASE_PATH}/conversations/${conversationId}`);

            const filteredConversations = items.filter(
                (conversation) => conversation.id !== conversationId,
            );

            const newLastId =
                lastId === conversationId
                    ? filteredConversations[filteredConversations.length - 1]?.id || undefined
                    : lastId;

            dispatch(
                setConversations({
                    items: filteredConversations,
                    hasMore,
                    lastId: newLastId,
                    loading,
                }),
            );
        } catch (e) {
            dispatch(setError(e as Error));
        }
    };

const ITEMS_PER_PAGE = 50;

export const loadConversation =
    (conversationId: string): AsyncAction =>
    async (dispatch, getState) => {
        const currentConversationId = selectConversationId(getState());

        if (currentConversationId === conversationId) {
            dispatch(setMode('chat'));
            return;
        }

        dispatch(setConversationId(conversationId));
        dispatch(
            setConversation({
                items: [],
            }),
        );
        dispatch(setLoading(true));
        dispatch(setMode('chat'));

        try {
            const response = await axios.get<GetConversationItemsResponse>(
                `${BASE_PATH}/conversations/${conversationId}/items`,
                {
                    params: {
                        order: 'desc',
                        limit: ITEMS_PER_PAGE,
                    },
                },
            );

            // API returns items in desc order (newest first), but we want to display oldest first
            const items = parseConversationItems(response.data.data).reverse();
            dispatch(
                setConversation({
                    items,
                    hasMore: response.data.has_more,
                    lastId: response.data.last_id,
                }),
            );
        } catch (e) {
            dispatch(setError(e as Error));
        } finally {
            dispatch(setLoading(false));
        }
    };

export const loadMoreConversationItems = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const conversationId = selectConversationId(state);
    const {items, lastId, hasMore, loading} = selectConversation(state);

    if (!conversationId) {
        return;
    }

    if (!hasMore || loading || !lastId) {
        return;
    }

    dispatch(setConversation({loading: true}));
    dispatch(setError(undefined));

    try {
        const response = await axios.get<GetConversationItemsResponse>(
            `${BASE_PATH}/conversations/${conversationId}/items`,
            {
                params: {
                    order: 'desc',
                    limit: ITEMS_PER_PAGE,
                    after: lastId,
                },
            },
        );

        // API returns items in desc order (newest first), but we want to display oldest first
        const newItems = parseConversationItems(response.data.data).reverse();

        dispatch(
            setConversation({
                items: [...newItems, ...items],
                hasMore: response.data.has_more,
                lastId: response.data.last_id,
            }),
        );
    } catch (e) {
        dispatch(setError(e as Error));
    } finally {
        dispatch(setConversation({loading: false}));
    }
};

export const toggleChatSidePanel = (): AsyncAction => (dispatch, getState) => {
    const open = selectChatOpen(getState());
    dispatch(setIsOpen(!open));
};

export const attachFiles =
    (files: File[]): AsyncAction =>
    async (dispatch, getState) => {
        const currentFiles = selectAttachedFiles(getState());

        for (const file of files) {
            if (currentFiles.some((f) => f.name === file.name && f.size === file.size)) {
                continue;
            }

            dispatch(addAttachedFile(file));
        }
    };
