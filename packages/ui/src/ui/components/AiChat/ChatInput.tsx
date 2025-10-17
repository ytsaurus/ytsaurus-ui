import React, {FC} from 'react';
import {Button, Flex, Icon, TextArea} from '@gravity-ui/uikit';
import ArrowUpIcon from '@gravity-ui/icons/svgs/arrow-up.svg';
import './ChatInput.scss';
import cn from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {setQuestion} from '../../store/reducers/ai/chatSlice';
import {selectChatQuestion} from '../../store/selectors/ai/chat';
import {sendQuestion} from '../../store/actions/ai/chat';
import ChevronDownIcon from '@gravity-ui/icons/svgs/chevron-down.svg';

const block = cn('yt-ai-chat-input');

type Props = {
    loading: boolean;
    showScrollButton: boolean;
    onScrollClick: () => void;
};

export const ChatInput: FC<Props> = ({showScrollButton, onScrollClick, loading}) => {
    const dispatch = useDispatch();
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
                    value={question}
                    onUpdate={handleQuestionChange}
                    onKeyDown={handleKeyDown}
                />
                <Button
                    view="action"
                    onClick={handleQuestionSubmit}
                    disabled={!question}
                    loading={loading}
                >
                    <Icon data={ArrowUpIcon} size={16} />
                </Button>
            </Flex>
        </div>
    );
};
