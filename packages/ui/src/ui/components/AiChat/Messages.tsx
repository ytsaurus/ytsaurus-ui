import React, {forwardRef} from 'react';
import {Message} from './Message';
import cn from 'bem-cn-lite';
import './Messages.scss';
import {ChatHistoryItem} from '../../store/reducers/ai/chatSlice';

const block = cn('yt-ai-chat-input-messages');

type Props = {
    items: ChatHistoryItem[];
};

export const Messages = forwardRef<HTMLDivElement, Props>(({items}, ref) => {
    return (
        <div ref={ref} className={block()}>
            {items.map((message) => {
                return <Message key={message.timestamp} message={message} />;
            })}
        </div>
    );
});

Messages.displayName = 'Messages';
