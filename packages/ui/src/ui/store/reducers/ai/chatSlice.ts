import {castDraft} from 'immer';
import {type Conversation} from '../../../../shared/ai-chat';
import {type PayloadAction, createSlice} from '@reduxjs/toolkit';
import {type TChatMessage} from '@gravity-ui/aikit';

type AiChatState = {
    conversation: {
        id?: string;
        items: TChatMessage[];
        loading: boolean;
        requestId?: string;
        hasMore: boolean;
        lastId?: string;
        loadingMore: boolean;
        loadMoreError?: Error;
        error?: Error;
    };
    conversations: {
        initialTitlePending: Record<string, boolean>;
        titleGenerating: Record<string, boolean>;
        deleting?: boolean;
        items: Conversation[];
        loading: boolean;
        hasMore: boolean;
        lastId?: string;
        error?: Error;
    };
    models: {
        items: string[];
        selected?: string;
        loading: boolean;
        loaded: boolean;
        error?: Error;
    };
    sending: boolean;
    isOpen: boolean;
    attachedFiles: File[];
};

const initialState: AiChatState = {
    conversation: {items: [], loading: false, hasMore: false, loadingMore: false},
    conversations: {
        items: [],
        loading: false,
        hasMore: false,
        initialTitlePending: {},
        titleGenerating: {},
    },
    models: {items: [], loading: false, loaded: false},
    sending: false,
    isOpen: false,
    attachedFiles: [],
};

const chatSlice = createSlice({
    initialState,
    name: 'aiChat',
    reducers: {
        setModels: (state, {payload}: PayloadAction<Partial<AiChatState['models']>>) => {
            Object.assign(state.models, payload);
        },
        setSelectedModel: (state, {payload}: PayloadAction<string>) => {
            if (!state.sending) state.models.selected = payload;
        },
        setConversation: (
            state,
            {payload}: PayloadAction<Partial<AiChatState['conversation']>>,
        ) => {
            Object.assign(state.conversation, payload);
        },
        setConversations: (
            state,
            {payload}: PayloadAction<Partial<AiChatState['conversations']>>,
        ) => {
            Object.assign(state.conversations, payload);
        },
        setInitialTitlePending: (
            state,
            {payload}: PayloadAction<{id: string; pending: boolean}>,
        ) => {
            if (payload.pending) state.conversations.initialTitlePending[payload.id] = true;
            else delete state.conversations.initialTitlePending[payload.id];
        },
        setTitleGenerating: (
            state,
            {payload}: PayloadAction<{id: string; generating: boolean}>,
        ) => {
            if (payload.generating) state.conversations.titleGenerating[payload.id] = true;
            else delete state.conversations.titleGenerating[payload.id];
        },
        setSending: (state, {payload}: PayloadAction<boolean>) => {
            state.sending = payload;
        },
        setIsOpen: (state, {payload}: PayloadAction<boolean>) => {
            state.isOpen = payload;
        },
        addConversationItem: (state, {payload}: PayloadAction<TChatMessage>) => {
            state.conversation.items.push(castDraft(payload));
        },
        addConversationItems: (state, {payload}: PayloadAction<TChatMessage[]>) => {
            state.conversation.items.push(...castDraft(payload));
        },
        resetChat: (state) => {
            return {
                ...initialState,
                isOpen: state.isOpen,
                conversations: state.conversations,
                models: state.models,
            };
        },
        addAttachedFile: (state, {payload}: PayloadAction<File>) => {
            state.attachedFiles.push(payload);
        },
        removeAttachedFile: (state, {payload}: PayloadAction<number>) => {
            state.attachedFiles.splice(payload, 1);
        },
        clearAttachedFiles: (state) => {
            state.attachedFiles = [];
        },
    },
});

export const {
    setModels,
    setSelectedModel,
    setConversation,
    setConversations,
    setSending,
    setInitialTitlePending,
    setTitleGenerating,
    setIsOpen,
    addConversationItem,
    addConversationItems,
    resetChat,
    addAttachedFile,
    removeAttachedFile,
    clearAttachedFiles,
} = chatSlice.actions;

export default chatSlice.reducer;
