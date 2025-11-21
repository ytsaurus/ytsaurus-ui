import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ChatMessage} from '../../../types/ai-chat';
import {Conversation} from '../../../../shared/ai-chat';

type Pagination = {
    lastId: string | undefined;
    loading: boolean;
    hasMore: boolean;
};

type Conversations = {
    items: Conversation[];
} & Pagination;

type ConversationItems = {
    items: ChatMessage[];
} & Pagination;

type CodeAssistantChatState = {
    mode: 'chat' | 'history';
    conversation: ConversationItems;
    conversations: Conversations;
    currentQuestion?: string;
    currentAnswer?: string;
    conversationId?: string;
    sending: boolean;
    loading: boolean;
    isOpen: boolean;
    error: Error | undefined;
    attachedFiles: File[];
};

const initialState: CodeAssistantChatState = {
    mode: 'chat',
    conversation: {
        items: [],
        hasMore: false,
        lastId: undefined,
        loading: false,
    },
    conversations: {
        items: [],
        hasMore: false,
        lastId: undefined,
        loading: false,
    },
    currentQuestion: undefined,
    currentAnswer: undefined,
    conversationId: undefined,
    sending: false,
    loading: false,
    isOpen: false,
    error: undefined,
    attachedFiles: [],
};

const chatSlice = createSlice({
    initialState,
    name: 'aiChat',
    reducers: {
        setMode: (state, {payload}: PayloadAction<'chat' | 'history'>) => {
            state.mode = payload;
        },
        setQuestion: (state, {payload}: PayloadAction<string | undefined>) => {
            state.currentQuestion = payload;
        },
        setCurrentAnswer: (state, {payload}: PayloadAction<string | undefined>) => {
            state.currentAnswer = payload;
        },
        setLoading: (state, {payload}: PayloadAction<boolean>) => {
            state.loading = payload;
        },
        setSending: (state, {payload}: PayloadAction<boolean>) => {
            state.sending = payload;
        },
        setIsOpen: (state, {payload}: PayloadAction<boolean>) => {
            state.isOpen = payload;
        },
        clearCurrentAnswer: (state) => {
            state.currentAnswer = undefined;
        },
        setConversationId: (state, {payload}: PayloadAction<string | undefined>) => {
            state.conversationId = payload;
        },
        setConversations: (state, {payload}: PayloadAction<Partial<Conversations>>) => {
            state.conversations = {...state.conversations, ...payload};
        },
        setConversation: (state, {payload}: PayloadAction<Partial<ConversationItems>>) => {
            state.conversation = {...state.conversation, ...payload};
        },
        addConversationItem: (state, {payload}: PayloadAction<ChatMessage>) => {
            state.conversation.items.push(payload);
        },
        resetChat: (state) => {
            return {...initialState, isOpen: state.isOpen};
        },
        setError: (state, {payload}: PayloadAction<Error | undefined>) => {
            state.error = payload;
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
    setMode,
    setQuestion,
    setCurrentAnswer,
    setLoading,
    setSending,
    setIsOpen,
    setConversation,
    addConversationItem,
    clearCurrentAnswer,
    setConversations,
    setConversationId,
    resetChat,
    setError,
    addAttachedFile,
    removeAttachedFile,
    clearAttachedFiles,
} = chatSlice.actions;

export default chatSlice.reducer;
