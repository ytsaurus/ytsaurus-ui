import moment from 'moment';
import {createSelector} from 'reselect';

import {type RootState} from '../../reducers';
import {type Conversation} from '../../../../shared/ai-chat';
import {Page} from '../../../../shared/constants/settings';
import {uiSettings} from '../../../config/ui-settings';
import {selectQueryDraft} from '../query-tracker/query';

const DEFAULT_AGENT = 'qt';

export const selectAiChatConfigured = () => Boolean(uiSettings.aiChatConfig);
export const selectAiChatModel = () => uiSettings.aiChatConfig?.model || '';
export const selectChatMode = (state: RootState) => state.aiChat.mode;
export const selectChatQuestion = (state: RootState) => state.aiChat.currentQuestion;
export const selectCurrentAnswer = (state: RootState) => state.aiChat.currentAnswer;
export const selectChatLoading = (state: RootState) => state.aiChat.loading;
export const selectChatSending = (state: RootState) => state.aiChat.sending;
export const selectChatOpen = (state: RootState) => state.aiChat.isOpen;
export const selectConversationId = (state: RootState) => state.aiChat.conversationId;
export const selectConversations = (state: RootState) => state.aiChat.conversations;
export const selectConversation = (state: RootState) => state.aiChat.conversation;

export const selectChatError = (state: RootState) => state.aiChat.error;
export const selectAttachedFiles = (state: RootState) => state.aiChat.attachedFiles;

export const selectConversationsItems = (state: RootState) => state.aiChat.conversations.items;
export const selectConversationsLoading = (state: RootState) => state.aiChat.conversations.loading;
export const selectConversationsHasMore = (state: RootState) => state.aiChat.conversations.hasMore;

export const selectChatIsVisible = createSelector(
    [selectChatMode, selectConversation, selectCurrentAnswer, selectChatSending],
    (mode, {items}, currentAnswer, isSending) => {
        return mode === 'chat' && (items.length > 0 || Boolean(currentAnswer) || isSending);
    },
);

export const selectChatHistoryIsVisible = createSelector([selectChatMode], (mode) => {
    return mode === 'history';
});

export type ConversationGroup = {
    date: string;
    items: Conversation[];
};

export const selectConversationsGroupedByDate = createSelector(
    [selectConversationsItems],
    (items): ConversationGroup[] => {
        const groupMap = new Map<string, Conversation[]>();

        items.forEach((conversation) => {
            const dateKey = moment(conversation.created_at * 1000)
                .startOf('day')
                .format('YYYY-MM-DD');

            if (!groupMap.has(dateKey)) {
                groupMap.set(dateKey, []);
            }
            groupMap.get(dateKey)!.push(conversation);
        });

        return Array.from(groupMap.entries()).map(([date, items]) => ({
            date,
            items,
        }));
    },
);

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
        meta: {agent: DEFAULT_AGENT},
        contextMessages,
    };
});

function getPageIdFromPathname(): string {
    const pathItems = window.location.pathname.split('/');
    return pathItems[2] || '';
}

const DEFAULT_PAGE_CONTEXT = {
    meta: {agent: DEFAULT_AGENT},
    contextMessages: [],
};

export const selectPageContext = (state: RootState) => {
    if (getPageIdFromPathname() === Page.QUERIES) {
        return selectQueryPageContext(state);
    }

    return DEFAULT_PAGE_CONTEXT;
};
