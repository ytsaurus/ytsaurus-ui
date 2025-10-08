import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ChatMessage} from '../../../types/ai-chat';
import {Conversation} from '../../../../shared/ai-chat';

type CodeAssistantChatState = {
    mode: 'chat' | 'history';
    items: ChatMessage[];
    conversations: Conversation[];
    currentQuestion?: string;
    currentAnswer?: string;
    conversationId?: string;
    sending: boolean;
    loading: boolean;
    isOpen: boolean;
    error: Error | undefined;
};

const initialState: CodeAssistantChatState = {
    mode: 'chat',
    items: [],
    conversations: [],
    currentQuestion: undefined,
    currentAnswer: undefined,
    conversationId: undefined,
    sending: false,
    loading: false,
    isOpen: false,
    error: undefined,
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
        setConversations: (state, {payload}: PayloadAction<Conversation[]>) => {
            state.conversations = payload;
        },
        setItems: (state, {payload}: PayloadAction<ChatMessage[]>) => {
            state.items = payload;
        },
        addItem: (state, {payload}: PayloadAction<ChatMessage>) => {
            state.items.push(payload);
        },
        resetChart: (state) => {
            return {...initialState, isOpen: state.isOpen};
        },
        setError: (state, {payload}: PayloadAction<Error | undefined>) => {
            state.error = payload;
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
    setItems,
    addItem,
    clearCurrentAnswer,
    setConversations,
    setConversationId,
    resetChart,
    setError,
} = chatSlice.actions;

export default chatSlice.reducer;
