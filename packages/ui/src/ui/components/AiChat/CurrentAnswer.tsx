import React, {FC} from 'react';
import {useSelector} from '../../store/redux-hooks';
import {selectChatSending, selectCurrentAnswer} from '../../store/selectors/ai/chat';
import {Message} from './Message';
import block from 'bem-cn-lite';
import './CurrentAnswer.scss';

const b = block('current-answer');

type Props = {
    className?: string;
};

const LoadingDots: FC<{className?: string}> = ({className}) => {
    return (
        <div className={b('loading-dots', className)}>
            <span className={b('dot')} />
            <span className={b('dot')} />
            <span className={b('dot')} />
        </div>
    );
};

export const CurrentAnswer: FC<Props> = ({className}) => {
    const answer = useSelector(selectCurrentAnswer);
    const isSending = useSelector(selectChatSending);

    if (isSending && !answer) return <LoadingDots className={className} />;

    if (!answer) return null;

    return (
        <Message
            className={className}
            message={{
                id: 'current-answer',
                type: 'answer',
                state: 'progress',
                value: answer,
            }}
        />
    );
};
