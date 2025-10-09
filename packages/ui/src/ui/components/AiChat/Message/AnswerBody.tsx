import React, {FC} from 'react';
import {Markdown} from '../../Markdown/Markdown';
import {ClipboardButton, Disclosure, Flex, Icon, Link, Text} from '@gravity-ui/uikit';
import LinkIcon from '@gravity-ui/icons/svgs/link.svg';
import {ChatAnswer} from '../../../store/reducers/ai/chatSlice';
import './AnswerBody.scss';
import cn from 'bem-cn-lite';
import {AnswerReaction} from './AnswerReaction';
import {useDispatch} from 'react-redux';
import {Reaction, StreamState} from '../../../../shared/ai-chat';
import {sendCopyTelemetry, sendReactionTelemetry} from '../../../store/actions/ai/chat';

const block = cn('yt-ai-chat-answer-body');

type Props = {
    message: ChatAnswer;
    className?: string;
};

export const AnswerBody: FC<Props> = ({message, className}) => {
    const dispatch = useDispatch();
    const reference = [...message.reference, ...message.peopleReferences];
    const inProgress =
        message.state === StreamState.Progress || message.state === StreamState.NotFound;

    const handleSendReaction = (reaction: Reaction, timestamp: number) => {
        dispatch(sendReactionTelemetry(timestamp, reaction));
    };

    const handleCopyAll = (content: string) => {
        dispatch(sendCopyTelemetry(content, message.timestamp));
    };

    const handleSendCopy = () => {
        const content = window.getSelection()?.toString();
        if (!content) return;

        handleCopyAll(content);
    };

    return (
        <Flex direction="column" gap={2} className={block(null, className)} onCopy={handleSendCopy}>
            <Markdown text={message.value || '...'} />

            <div className={block('footer')}>
                <Disclosure
                    arrowPosition="end"
                    summary={
                        <Text variant="subheader-1">
                            <Icon data={LinkIcon} /> Reference
                        </Text>
                    }
                >
                    <Flex direction="column" gap={1} className={block('references')}>
                        {reference.map((item) => {
                            return (
                                <Link key={item.Url} href={item.Url} target="_blank">
                                    {item.Title}
                                </Link>
                            );
                        })}
                    </Flex>
                </Disclosure>

                {!inProgress && (
                    <Flex gap={1} className={block('actions')}>
                        <ClipboardButton text={message.value} onCopy={handleCopyAll} />
                        <AnswerReaction
                            timestamp={message.timestamp}
                            reaction={message.reaction}
                            onAnswer={handleSendReaction}
                        />
                    </Flex>
                )}
            </div>
        </Flex>
    );
};
