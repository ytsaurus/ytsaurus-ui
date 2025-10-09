import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import './Chat.scss';
import cn from 'bem-cn-lite';
import {ChatInput} from './ChatInput';
import {Messages} from './Messages';
import {useSelector} from 'react-redux';
import {selectChatHistory, selectChatLoading} from '../../store/selectors/ai/chat';
import {EmptyChat} from './EmptyChat';
import useResizeObserver from '../../hooks/useResizeObserver';

const INPUT_DEFAULT_HEIGHT = 50;
const SCROLL_THRESHOLD = INPUT_DEFAULT_HEIGHT;

const block = cn('yt-ai-chat');

const Chat: FC = () => {
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const messagesRef = useRef<HTMLDivElement>(null);
    const history = useSelector(selectChatHistory);
    const loading = useSelector(selectChatLoading);

    const checkScrollPosition = useCallback(() => {
        if (!containerRef.current) return;

        const {scrollTop, scrollHeight, clientHeight} = containerRef.current;
        const isAtBottom = scrollHeight - (scrollTop + clientHeight) < SCROLL_THRESHOLD;

        setIsScrolledToBottom(isAtBottom);
        setIsUserScrolledUp(!isAtBottom);
    }, []);

    const scrollToBottom = useCallback((behavior: ScrollBehavior = 'auto') => {
        if (!containerRef.current) return;

        containerRef.current.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior,
        });
    }, []);

    const handleUserScroll = useCallback(() => {
        checkScrollPosition();
    }, [checkScrollPosition]);

    const handleContainerResize = useCallback(() => {
        checkScrollPosition();
        if (loading) {
            if (isUserScrolledUp) return;
            scrollToBottom();
        }
    }, [checkScrollPosition, isUserScrolledUp, loading, scrollToBottom]);

    useResizeObserver({
        element: messagesRef.current ?? undefined,
        onResize: handleContainerResize,
    });

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        container.addEventListener('scroll', handleUserScroll);
        return () => {
            container.removeEventListener('scroll', handleUserScroll);
        };
    }, [handleUserScroll]);

    return (
        <div ref={containerRef} className={block()}>
            {history.length ? <Messages ref={messagesRef} items={history} /> : <EmptyChat />}
            <ChatInput
                loading={loading}
                showScrollButton={!isScrolledToBottom}
                onScrollClick={() => scrollToBottom('smooth')}
            />
        </div>
    );
};

export default Chat;
