import React, {FC, useCallback, useEffect, useRef, useState} from 'react';
import './Chat.scss';
import cn from 'bem-cn-lite';
import {ChatInput} from './ChatInput';
import {ChatHeader} from './ChatHeader';
import {ChatBody} from './ChatBody';

const INPUT_DEFAULT_HEIGHT = 50;
const SCROLL_THRESHOLD = INPUT_DEFAULT_HEIGHT;

const block = cn('yt-ai-chat');

const Chat: FC = () => {
    const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
    const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

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
            <ChatHeader className={block('header')} />
            <ChatBody
                scrollToBottom={scrollToBottom}
                checkScrollPosition={checkScrollPosition}
                isUserScrolledUp={isUserScrolledUp}
            />
            <ChatInput
                showScrollButton={!isScrolledToBottom}
                onScrollClick={() => scrollToBottom('smooth')}
            />
        </div>
    );
};

export default Chat;
