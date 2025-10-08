import React, {FC, useCallback} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import block from 'bem-cn-lite';
import {
    deleteConversation,
    loadConversation,
    loadMoreConversations,
} from '../../../store/actions/ai/chat';
import {Flex, List, Text} from '@gravity-ui/uikit';
import {
    selectConversationsGroupedByDate,
    selectConversationsHasMore,
    selectConversationsLoading,
} from '../../../store/selectors/ai/chat';
import {NoContent} from '../../../components/NoContent/NoContent';
import {InfiniteScrollLoader} from '../../../components/InfiniteScrollLoader';
import i18n from './i18n';
import './ChatHistory.scss';
import {Conversation} from '../../../../shared/ai-chat';
import hammer from '../../../common/hammer';
import {ChatHistoryItem} from './ChatHistoryItem';

const b = block('yt-chart-history');

export const ChatHistory: FC = () => {
    const dispatch = useDispatch();
    const groupedConversations = useSelector(selectConversationsGroupedByDate);
    const hasMore = useSelector(selectConversationsHasMore);
    const loading = useSelector(selectConversationsLoading);

    const handleConversationClick = (conversationId: string) => {
        dispatch(loadConversation(conversationId));
    };

    const handleConversationDelete = (conversationId: string) => {
        dispatch(deleteConversation(conversationId));
    };

    const handleLoadMore = useCallback(() => {
        dispatch(loadMoreConversations());
    }, [dispatch]);

    if (!groupedConversations.length) {
        return (
            <Flex justifyContent="center" alignItems="center" grow={1}>
                <NoContent warning={i18n('context_no-conversations')} vertical />
            </Flex>
        );
    }

    return (
        <div className={b()}>
            {groupedConversations.map((group) => (
                <div key={group.date} className={b('group')}>
                    <div className={b('group-header')}>
                        <Text color="secondary">
                            {hammer.format['DateTime'](group.date, {format: 'day'})}
                        </Text>
                    </div>
                    <List<Conversation>
                        className={b('list')}
                        filterable={false}
                        items={group.items}
                        renderItem={(item, _) => {
                            return (
                                <ChatHistoryItem
                                    id={item.id}
                                    topic={item.metadata?.topic}
                                    onClick={handleConversationClick}
                                    onDelete={handleConversationDelete}
                                />
                            );
                        }}
                        itemHeight={40}
                        virtualized={false}
                    />
                </div>
            ))}
            {hasMore && (
                <InfiniteScrollLoader
                    className={b('pagination')}
                    loading={loading}
                    onLoadMore={handleLoadMore}
                />
            )}
        </div>
    );
};
