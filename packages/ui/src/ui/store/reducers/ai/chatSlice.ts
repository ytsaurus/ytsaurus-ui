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
    attachedFiles: File[];
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
    setItems,
    addItem,
    clearCurrentAnswer,
    setConversations,
    setConversationId,
    resetChart,
    setError,
    addAttachedFile,
    removeAttachedFile,
    clearAttachedFiles,
} = chatSlice.actions;

export default chatSlice.reducer;
