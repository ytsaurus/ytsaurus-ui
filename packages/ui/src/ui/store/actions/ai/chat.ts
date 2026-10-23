import {type ThunkAction} from 'redux-thunk';
import {type Action} from 'redux';
import axios from 'axios';
import i18n from '../../../containers/AiChat/i18n';
import {v4 as uuidv4} from 'uuid';
import {type RootState} from '../../reducers';
import {
    selectAttachedFiles,
    selectChatOpen,
    selectChatSending,
    selectConversation,
    selectConversations,
    selectPageContext,
} from '../../selectors/ai/chat';
import {
    addAttachedFile,
    addConversationItem,
    resetChat,
    setConversation,
    setConversations,
    setInitialTitlePending,
    setIsOpen,
    setSending,
} from '../../reducers/ai/chatSlice';
import {
    type Conversation,
    type ConversationItem,
    type ConversationPage,
    createResponseInput,
} from '../../../../shared/ai-chat';
import {parseConversationItems} from './helpers';

const BASE_PATH = '/api/code-assistant';
const TITLE_GENERATION_FREQUENCY = 5;

type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

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

// Request orchestration only; AIKit consumes the response and prepares messages.
export const sendQuestion =
    ({
        message: question,
        signal,
    }: {
        message: string;
        signal: AbortSignal;
    }): ThunkAction<Promise<Response | undefined>, RootState, undefined, Action> =>
    async (dispatch, getState) => {
        const state = getState();
        const conversation = selectConversation(state);
        if (
            selectChatSending(state) ||
            conversation.loading ||
            conversation.error ||
            selectConversations(state).deleting ||
            !question.trim()
        )
            return undefined;

        const attachedFiles = selectAttachedFiles(state);
        const {contextMessages, meta} = selectPageContext(state);
        dispatch(addConversationItem({id: uuidv4(), role: 'user', content: question}));
        dispatch(setSending(true));
        const files = await Promise.all(
            attachedFiles.map(async (file) => ({
                name: file.name,
                content: await readFileAsText(file),
            })),
        );
        signal.throwIfAborted();
        let conversationId = conversation.id;
        if (!conversationId) {
            const {data} = await axios.post<Conversation>(
                `${BASE_PATH}/create-conversation`,
                {
                    topic: question.trim().slice(0, 100),
                },
                {signal},
            );
            signal.throwIfAborted();
            conversationId = data.id;
            dispatch(setConversation({id: conversationId}));
            dispatch(setInitialTitlePending({id: conversationId, pending: true}));
            const history = selectConversations(getState());
            dispatch(
                setConversations({
                    items: [data, ...history.items.filter(({id}) => id !== data.id)],
                }),
            );
        }
        return fetch(`${BASE_PATH}/send-message`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                input: createResponseInput({message: question, contextMessages, files}),
                conversation: conversationId,
                metadata: meta,
            }),
            signal,
        });
    };

export const summarizeConversationTitle = (): AsyncAction => async (dispatch, getState) => {
    const conversation = selectConversation(getState());
    if (
        !conversation.id ||
        (!selectConversations(getState()).initialTitlePending[conversation.id] &&
            (!conversation.items.length ||
                conversation.items.length % TITLE_GENERATION_FREQUENCY !== 0))
    )
        return;
    const conversationId = conversation.id;
    try {
        const {data} = await axios.post<{title: string}>(
            `${BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/summarize-title`,
            {metadata: selectPageContext(getState()).meta},
        );
        const history = selectConversations(getState());
        dispatch(
            setConversations({
                items: history.items.map((item) =>
                    item.id === conversationId
                        ? {...item, metadata: {...item.metadata, topic: data.title}}
                        : item,
                ),
            }),
        );
        dispatch(setInitialTitlePending({id: conversationId, pending: false}));
    } catch (error) {
        // Keep the answer and fallback title usable if summarization fails.
        dispatch(setConversations({error: error as Error}));
    }
};

export const toggleChatSidePanel = (): AsyncAction => (dispatch, getState) => {
    const open = selectChatOpen(getState());
    dispatch(setIsOpen(!open));
};

export const attachFiles =
    (files: File[]): AsyncAction =>
    async (dispatch, getState) => {
        if (selectChatSending(getState())) return;
        const currentFiles = [...selectAttachedFiles(getState())];

        for (const file of files) {
            if (currentFiles.some((f) => f.name === file.name && f.size === file.size)) {
                continue;
            }

            dispatch(addAttachedFile(file));
            currentFiles.push(file);
        }
    };

export const getConversations =
    (loadMore = false): AsyncAction =>
    async (dispatch, getState) => {
        const history = selectConversations(getState());
        if (history.loading || (loadMore && !history.hasMore)) return;
        dispatch(setConversations({loading: true, error: undefined}));
        try {
            const {data} = await axios.get<ConversationPage<Conversation>>(
                `${BASE_PATH}/conversations`,
                {
                    params: {limit: 20, after: loadMore ? history.lastId : undefined},
                },
            );
            const current = selectConversations(getState());
            const activeId = selectConversation(getState()).id;
            const retained = loadMore
                ? current.items
                : current.items.filter(({id}) => id === activeId);
            const items = [
                ...retained,
                ...data.data.filter(({id}) => !retained.some((item) => item.id === id)),
            ];
            dispatch(
                setConversations({
                    items,
                    hasMore: data.has_more,
                    lastId: data.last_id || undefined,
                }),
            );
        } catch (error) {
            dispatch(setConversations({error: error as Error}));
        } finally {
            dispatch(setConversations({loading: false}));
        }
    };

export const loadConversation =
    (conversationId: string): AsyncAction =>
    async (dispatch, getState) => {
        if (selectChatSending(getState())) return;
        if (selectConversations(getState()).deleting) return;
        const requestId = uuidv4();
        dispatch(resetChat());
        dispatch(setConversation({id: conversationId, requestId, loading: true}));
        const isCurrent = () => selectConversation(getState()).requestId === requestId;
        try {
            const {data} = await axios.get<ConversationPage<ConversationItem>>(
                `${BASE_PATH}/conversations/${encodeURIComponent(conversationId)}/items`,
            );
            if (!isCurrent()) return;
            if (data.has_more && !data.last_id) throw new Error(i18n('alert_response-incomplete'));
            dispatch(
                setConversation({
                    items: parseConversationItems(data.data).reverse(),
                    hasMore: data.has_more,
                    lastId: data.last_id || undefined,
                }),
            );
        } catch (error) {
            if (isCurrent()) dispatch(setConversation({error: error as Error}));
        } finally {
            if (isCurrent()) dispatch(setConversation({loading: false}));
        }
    };

export const loadMoreConversationItems = (): AsyncAction => async (dispatch, getState) => {
    const conversation = selectConversation(getState());
    if (
        !conversation.id ||
        !conversation.hasMore ||
        !conversation.lastId ||
        conversation.loading ||
        conversation.loadingMore ||
        selectConversations(getState()).deleting
    )
        return;
    const isCurrent = () =>
        selectConversation(getState()).requestId === conversation.requestId &&
        selectConversation(getState()).id === conversation.id;
    dispatch(setConversation({loadingMore: true, loadMoreError: undefined}));
    try {
        const {data} = await axios.get<ConversationPage<ConversationItem>>(
            `${BASE_PATH}/conversations/${encodeURIComponent(conversation.id)}/items`,
            {params: {after: conversation.lastId}},
        );
        if (!isCurrent()) return;
        if (data.has_more && (!data.last_id || data.last_id === conversation.lastId))
            throw new Error(i18n('alert_response-incomplete'));
        const current = selectConversation(getState());
        const previousItems = parseConversationItems(data.data)
            .reverse()
            .filter(({id}) => !current.items.some((item) => item.id === id));
        dispatch(
            setConversation({
                items: [...previousItems, ...current.items],
                hasMore: data.has_more,
                lastId: data.last_id || undefined,
            }),
        );
    } catch (error) {
        if (isCurrent()) dispatch(setConversation({loadMoreError: error as Error}));
    } finally {
        if (isCurrent()) dispatch(setConversation({loadingMore: false}));
    }
};

export const deleteConversation =
    (conversationId: string): AsyncAction =>
    async (dispatch, getState) => {
        if (selectChatSending(getState()) || selectConversations(getState()).loading) {
            throw new Error('Cannot delete a conversation while a chat request is in progress');
        }
        dispatch(setConversations({loading: true, deleting: true, error: undefined}));
        try {
            await axios.delete(`${BASE_PATH}/conversations/${encodeURIComponent(conversationId)}`);
            const history = selectConversations(getState());
            const items = history.items.filter(({id}) => id !== conversationId);
            dispatch(
                setConversations({
                    items,
                    lastId: history.lastId === conversationId ? items.at(-1)?.id : history.lastId,
                }),
            );
            dispatch(setInitialTitlePending({id: conversationId, pending: false}));
            if (selectConversation(getState()).id === conversationId) dispatch(resetChat());
        } catch (error) {
            dispatch(setConversations({error: error as Error}));
            // AIKit removes the row locally only when this promise resolves.
            throw error;
        } finally {
            dispatch(setConversations({loading: false, deleting: false}));
        }
    };
