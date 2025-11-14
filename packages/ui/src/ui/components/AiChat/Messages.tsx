import React, {FC} from 'react';
import {Message} from './Message';
import {useSelector} from 'react-redux';
import {selectConversationItems} from '../../store/selectors/ai/chat';

export const Messages: FC = () => {
    const items = useSelector(selectConversationItems);

    return (
        <>
            {items.map((message) => {
                const key = 'id' in message ? message.id : message.error.message;
                return <Message key={key} message={message} />;
            })}
        </>
    );
};

Messages.displayName = 'Messages';
