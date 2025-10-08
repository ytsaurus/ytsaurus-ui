import React, {FC} from 'react';
import {useSelector} from 'react-redux';
import {selectChatSending, selectCurrentAnswer} from '../../store/selectors/ai/chat';
import {Message} from './Message';
import {Icon} from '@gravity-ui/uikit';
import EllipsisIcon from '@gravity-ui/icons/svgs/ellipsis.svg';

type Props = {
    className?: string;
};

export const CurrentAnswer: FC<Props> = ({className}) => {
    const answer = useSelector(selectCurrentAnswer);
    const isSending = useSelector(selectChatSending);

    if (isSending && !answer) return <Icon className={className} data={EllipsisIcon} />;

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
