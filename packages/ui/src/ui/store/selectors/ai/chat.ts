import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';
import {Page} from '../../../../shared/constants/settings';
import {uiSettings} from '../../../config/ui-settings';
import {selectQueryDraft} from '../query-tracker/query';

export const selectAiChatConfigured = () => Boolean(uiSettings.aiChatConfig);
export const selectConversations = (state: RootState) => state.aiChat.conversations;
export const selectChatSending = (state: RootState) => state.aiChat.sending;
export const selectChatOpen = (state: RootState) => state.aiChat.isOpen;
export const selectConversation = (state: RootState) => state.aiChat.conversation;

export const selectAttachedFiles = (state: RootState) => state.aiChat.attachedFiles;

const selectQueryPageContext = createSelector([selectQueryDraft], (draft) => {
    const contextMessages: string[] = [];

    if (draft.query && draft.query.trim()) {
        contextMessages.push(`<query>\n${draft.query}\n</query>`);
    }

    if (draft.error) {
        const errorText =
            typeof draft.error === 'string' ? draft.error : JSON.stringify(draft.error, null, 2);
        contextMessages.push(`<error>\n${errorText}\n</error>`);
    }

    return {
        meta: {},
        contextMessages,
    };
});

function getPageIdFromPathname(): string {
    const pathItems = window.location.pathname.split('/');
    return pathItems[2] || '';
}

const DEFAULT_PAGE_CONTEXT = {
    meta: {},
    contextMessages: [],
};

export const selectPageContext = (state: RootState) => {
    if (getPageIdFromPathname() === Page.QUERIES) {
        return selectQueryPageContext(state);
    }

    return DEFAULT_PAGE_CONTEXT;
};
