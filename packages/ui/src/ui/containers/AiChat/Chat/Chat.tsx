import React from 'react';
import cn from 'bem-cn-lite';
import {ChatContainer} from '@gravity-ui/aikit/ChatContainer';
import copy from 'copy-to-clipboard';
import type {TAssistantMessage} from '@gravity-ui/aikit';
import {type AiChatProps} from '../../../UIFactory';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {
    selectChatSending,
    selectConversation,
    selectConversations,
} from '../../../store/selectors/ai/chat';
import {
    deleteConversation,
    getConversations,
    loadConversation,
    loadMoreConversationItems,
} from '../../../store/actions/ai/chat';
import {resetChat} from '../../../store/reducers/ai/chatSlice';
import {ChatAttachments} from '../ChatAttachments/ChatAttachments';
import {MessageError} from '../MessageError/MessageError';
import {useChatController} from '../ChatProvider/ChatProvider';
import {toChat} from '../adapters';
import i18n from '../i18n';
import '@gravity-ui/aikit/styles';
import './Chat.scss';

const block = cn('yt-ai-chat');
function copyMessage(message: TAssistantMessage) {
    const {content} = message;
    const text =
        typeof content === 'string'
            ? content
            : (Array.isArray(content) ? content : [content])
                  .filter((part) => part.type === 'text')
                  .map((part) => (part.data as {text: string}).text)
                  .join('\n\n');
    copy(text);
}

export default function Chat({onClose}: AiChatProps) {
    const dispatch = useDispatch();
    const conversation = useSelector(selectConversation);
    const history = useSelector(selectConversations);
    const chats = history.items.map(toChat);
    const {messages, status, onSend, onCancel} = useChatController();
    const sending = useSelector(selectChatSending);
    const busy = sending || conversation.loading || Boolean(history.deleting);
    const error = conversation.error || conversation.loadMoreError;
    let displayStatus = status;
    if (conversation.loading || history.deleting) displayStatus = 'submitted';
    if (error) displayStatus = 'error';

    return (
        <div className={block()}>
            <ChatContainer
                className={block('container')}
                qa={{prefix: 'oss-ai-chat'}}
                messages={messages}
                chats={chats}
                activeChat={
                    chats.find(({id}) => id === conversation.id) ||
                    (conversation.id
                        ? {id: conversation.id, name: i18n('action_new-chat'), createTime: null}
                        : null)
                }
                onSelectChat={({id}) => {
                    dispatch(loadConversation(id));
                }}
                onDeleteChat={
                    busy || history.loading
                        ? undefined
                        : async ({id}) => {
                              await dispatch(deleteConversation(id));
                          }
                }
                headerProps={{
                    onHistoryToggle: (open) => {
                        if (open) dispatch(getConversations());
                    },
                }}
                historyProps={{
                    loading: history.loading,
                    hasMore: history.hasMore,
                    onLoadMore: () => {
                        dispatch(getConversations(true));
                    },
                }}
                error={error}
                onRetry={() => {
                    if (conversation.loadMoreError) dispatch(loadMoreConversationItems());
                    else if (conversation.id) dispatch(loadConversation(conversation.id));
                }}
                status={displayStatus}
                onSendMessage={onSend}
                onCancel={onCancel}
                shouldParseIncompleteMarkdown
                openMarkdownLinksInNewTab
                onCreateChat={() => {
                    if (!sending) dispatch(resetChat());
                }}
                onClose={onClose}
                showClose
                showHistory={!sending}
                showNewChat={!sending}
                messageListConfig={{
                    hasPreviousMessages: conversation.hasMore && !conversation.loadMoreError,
                    onLoadPreviousMessages: () => {
                        dispatch(loadMoreConversationItems());
                    },
                    assistantExtraInfo: MessageError,
                    userActions: [],
                    assistantActions: [{type: 'copy', onClick: copyMessage}],
                }}
                promptInputProps={{
                    disabled:
                        conversation.loading || Boolean(history.deleting || conversation.error),
                    bodyProps: {disabledInput: sending},
                    footerProps: {attachmentContent: <ChatAttachments />},
                }}
                welcomeConfig={{
                    title: i18n('title_greeting'),
                    description: i18n('context_help-offer'),
                }}
                texts={{
                    headerTitle: i18n('title_chat'),
                    headerNewChatTooltip: i18n('action_new-chat'),
                    headerCloseTooltip: i18n('action_close-chat'),
                }}
            />
        </div>
    );
}
