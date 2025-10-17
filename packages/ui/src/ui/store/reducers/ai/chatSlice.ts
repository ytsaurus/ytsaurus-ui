import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Reaction, Reference, StreamState} from '../../../../shared/ai-chat';

export type ChatQuestion = {
    type: 'question';
    value: string;
    timestamp: number;
};

export type ChatAnswer = {
    type: 'answer';
    taskId: string;
    state: StreamState;
    requestId: string;
    value: string;
    timestamp: number;
    reference: Reference[];
    peopleReferences: Reference[];
    reaction: Reaction;
};

export type ChatError = {
    type: 'error';
    timestamp: number;
    error: Error;
};

export type ChatHistoryItem = ChatQuestion | ChatAnswer | ChatError;

type CodeAssistantChatState = {
    history: ChatHistoryItem[];
    question: string;
    loading: boolean;
    isOpen: boolean;
};

const initialState: CodeAssistantChatState = {
    history: [],
    question: '',
    loading: false,
    isOpen: false,
};

const chatSlice = createSlice({
    initialState,
    name: 'aiChat',
    reducers: {
        setQuestion: (state, {payload}: PayloadAction<string>) => {
            state.question = payload;
        },
        setHistory: (state, {payload}: PayloadAction<ChatHistoryItem[]>) => {
            state.history = payload;
        },
        setLoading: (state, {payload}: PayloadAction<boolean>) => {
            state.loading = payload;
        },
        setIsOpen: (state, {payload}: PayloadAction<boolean>) => {
            state.isOpen = payload;
        },
        addHistoryItem: (state, {payload}: PayloadAction<ChatHistoryItem>) => {
            state.history.push(payload);
        },
    },
});

export const {setQuestion, setHistory, setLoading, setIsOpen, addHistoryItem} = chatSlice.actions;

export default chatSlice.reducer;
