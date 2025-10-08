import React, {FC} from 'react';
import {Flex} from '@gravity-ui/uikit';
import cn from 'bem-cn-lite';
import {ChatMessage} from '../../../types/ai-chat';
import uiFactory from '../../../UIFactory';
import {getMessageComponentByType} from './getMessageComponentByType';
import './Message.scss';

const block = cn('yt-ai-chat-message');

type Props = {
    message: ChatMessage;
    className?: string;
};

export const Message: FC<Props> = ({message, className}) => {
    const isQuestion = message.type === 'question';
    const component = uiFactory.getAiChatMessageComponent(message, block('body'));

    return (
        <Flex
            justifyContent={isQuestion ? 'flex-end' : 'flex-start'}
            className={block({question: isQuestion}, className)}
            gap={1}
        >
            {component || getMessageComponentByType(message, block('body'))}
        </Flex>
    );
};
