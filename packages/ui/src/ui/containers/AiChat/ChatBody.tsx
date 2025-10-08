import React, {FC, useCallback, useRef} from 'react';
import {
    selectChatError,
    selectChatHistoryIsVisible,
    selectChatIsVisible,
    selectChatLoading,
    selectChatSending,
} from '../../store/selectors/ai/chat';
import {useSelector} from '../../store/redux-hooks';
import {EmptyChat} from './EmptyChat';
import {Messages} from './Messages';
import {CurrentAnswer} from './CurrentAnswer';
import {ChatHistory} from './ChatHistory';
import useResizeObserver from '../../hooks/useResizeObserver';
import './ChatBody.scss';
import cn from 'bem-cn-lite';
import {Flex, Loader} from '@gravity-ui/uikit';
import {YTErrorBlock} from '../../components/Block/Block';

const block = cn('yt-ai-chat-body');

type Props = {
    isUserScrolledUp: boolean;
    scrollToBottom: () => void;
    checkScrollPosition: () => void;
};

export const ChatBody: FC<Props> = ({isUserScrolledUp, scrollToBottom, checkScrollPosition}) => {
    const messagesRef = useRef<HTMLDivElement>(null);
    const isLoading = useSelector(selectChatLoading);
    const isSending = useSelector(selectChatSending);
    const chatIsVisible = useSelector(selectChatIsVisible);
    const historyIsVisible = useSelector(selectChatHistoryIsVisible);
    const error = useSelector(selectChatError);

    const handleContainerResize = useCallback(() => {
        checkScrollPosition();
        if (isSending && !isUserScrolledUp) {
            scrollToBottom();
        }
    }, [checkScrollPosition, isUserScrolledUp, isSending, scrollToBottom]);

    useResizeObserver({
        element: chatIsVisible ? (messagesRef.current ?? undefined) : undefined,
        onResize: handleContainerResize,
    });

    if (error) {
        return (
            <Flex alignItems="center" justifyContent="center" grow={1}>
                <YTErrorBlock error={error} />
            </Flex>
        );
    }

    if (isLoading) {
        return (
            <Flex alignItems="center" justifyContent="center" grow={1}>
                <Loader />
            </Flex>
        );
    }

    if (chatIsVisible) {
        return (
            <div ref={messagesRef} className={block('messages')}>
                <Messages />
                <CurrentAnswer className={block('current-answer')} />
            </div>
        );
    }

    if (historyIsVisible) {
        return <ChatHistory />;
    }

    return <EmptyChat />;
};
