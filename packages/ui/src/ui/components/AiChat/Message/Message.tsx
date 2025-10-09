import React, {FC, useMemo} from 'react';
import {ChatAnswer, ChatError, ChatQuestion} from '../../../store/reducers/ai/chatSlice';
import {Flex} from '@gravity-ui/uikit';
import './Message.scss';
import cn from 'bem-cn-lite';
import {AnswerBody} from './AnswerBody';
import {YTErrorBlock} from '../../Error/Error';

const block = cn('yt-ai-chat-message');

type Props = {
    message: ChatQuestion | ChatAnswer | ChatError;
};

export const Message: FC<Props> = ({message}) => {
    const isQuestion = message.type === 'question';

    const content = useMemo(() => {
        switch (message.type) {
            case 'error': {
                return <YTErrorBlock className={block('error')} error={message.error} />;
            }
            case 'answer': {
                return <AnswerBody className={block('body')} message={message} />;
            }
            default: {
                return <div className={block('body')}>{message.value}</div>;
            }
        }
    }, [message]);

    return (
        <Flex
            justifyContent={isQuestion ? 'flex-end' : 'flex-start'}
            className={block({question: isQuestion})}
        >
            {content}
        </Flex>
    );
};
