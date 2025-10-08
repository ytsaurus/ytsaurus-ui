import React, {FC} from 'react';
import {Button, Flex, Icon, TextArea} from '@gravity-ui/uikit';
import ArrowUpIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import './ChatInput.scss';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {setQuestion} from '../../store/reducers/ai/chatSlice';
import {selectChatQuestion, selectChatSending} from '../../store/selectors/ai/chat';
import {sendQuestion} from '../../store/actions/ai/chat';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';
import {ChatFileButton} from './ChatFile';

const block = cn('yt-ai-chat-input');

type Props = {
    showScrollButton: boolean;
    onScrollClick: () => void;
};

export const ChatInput: FC<Props> = ({showScrollButton, onScrollClick}) => {
    const dispatch = useDispatch();
    const isSending = useSelector(selectChatSending);
    const question = useSelector(selectChatQuestion);

    const handleQuestionChange = (value: string) => {
        dispatch(setQuestion(value));
    };

    const handleQuestionSubmit = () => {
        dispatch(sendQuestion());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleQuestionSubmit();
        }
    };

    return (
        <div className={block()}>
            {showScrollButton && (
                <Button view="outlined" className={block('scroll-button')} onClick={onScrollClick}>
                    <Icon data={ChevronDownIcon} size={16} />
                </Button>
            )}

            <Flex className={block('form')} justifyContent="space-between" alignItems="flex-end">
                <TextArea
                    view="clear"
                    value={question || ''}
                    onUpdate={handleQuestionChange}
                    onKeyDown={handleKeyDown}
                />
                <Flex gap={1}>
                    <ChatFileButton />
                    <Button
                        view="action"
                        onClick={handleQuestionSubmit}
                        disabled={!question}
                        loading={isSending}
                    >
                        <Icon data={ArrowUpIcon} size={16} />
                    </Button>
                </Flex>
            </Flex>
        </div>
    );
};
