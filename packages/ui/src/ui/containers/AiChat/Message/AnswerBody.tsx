import React, {FC} from 'react';
import {Markdown} from '../../../components/Markdown/Markdown';
import {ClipboardButton, Flex} from '@gravity-ui/uikit';
import {ChatAnswer} from '../../../types/ai-chat';
import './AnswerBody.scss';
import cn from 'bem-cn-lite';

const block = cn('yt-ai-chat-answer-body');

type Props = {
    message: ChatAnswer;
    className?: string;
};

export const AnswerBody: FC<Props> = ({message, className}) => {
    const inProgress = message.state === 'progress';

    const handleSendCopy = () => {
        const content = window.getSelection()?.toString();
        if (!content) return;
    };

    return (
        <Flex direction="column" gap={2} className={block(null, className)} onCopy={handleSendCopy}>
            <Markdown text={message.value || '...'} />

            <Flex gap={1} className={block('footer')}>
                {!inProgress && (
                    <>
                        <ClipboardButton size="s" text={message.value} />
                    </>
                )}
            </Flex>
        </Flex>
    );
};
