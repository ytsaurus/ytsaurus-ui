import React, {FC} from 'react';
import {Button, Flex, Icon, Tooltip} from '@gravity-ui/uikit';
import PlusIcon from '@gravity-ui/icons/svgs/plus.svg';
import ListUlIcon from '@gravity-ui/icons/svgs/list-ul.svg';
import XmarkIcon from '@gravity-ui/icons/svgs/xmark.svg';
import {toggleChatHistory, toggleChatSidePanel} from '../../../store/actions/ai/chat';
import {useDispatch} from '../../../store/redux-hooks';
import {resetChat} from '../../../store/reducers/ai/chatSlice';
import i18n from './i18n';

type Props = {
    className?: string;
};

export const ChatHeader: FC<Props> = ({className}) => {
    const dispatch = useDispatch();

    const handleNewChat = () => {
        dispatch(resetChat());
    };

    const handleToggleHistory = () => {
        dispatch(toggleChatHistory());
    };

    const closeChat = () => {
        dispatch(toggleChatSidePanel());
    };

    return (
        <Flex justifyContent="flex-end" alignItems="center" gap={1} className={className}>
            <Tooltip content={i18n('action_new-chat')}>
                <Button view="flat" onClick={handleNewChat}>
                    <Icon data={PlusIcon} size={16} />
                </Button>
            </Tooltip>
            <Tooltip content={i18n('action_history')}>
                <Button view="flat" onClick={handleToggleHistory}>
                    <Icon data={ListUlIcon} size={16} />
                </Button>
            </Tooltip>
            <Tooltip content={i18n('action_close-chat')}>
                <Button view="flat" onClick={closeChat}>
                    <Icon data={XmarkIcon} size={16} />
                </Button>
            </Tooltip>
        </Flex>
    );
};
