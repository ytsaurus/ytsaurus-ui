import {RootState} from '../../reducers';

export const selectChatQuestion = (state: RootState) => state.aiChat.question;
export const selectChatHistory = (state: RootState) => state.aiChat.history;
export const selectChatLoading = (state: RootState) => state.aiChat.loading;
export const selectChatOpen = (state: RootState) => state.aiChat.isOpen;
