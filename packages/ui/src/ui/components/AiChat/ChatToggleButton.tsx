import React from 'react';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import AiIcon from '../../assets/img/svg/icons/ai-assistant.svg';
import {useDispatch} from 'react-redux';
import {toggleChatSidePanel} from '../../store/actions/ai/chat';

export const ChatToggleButton = () => {
    const dispatch = useDispatch();

    const handleToggle = () => {
        dispatch(toggleChatSidePanel());
    };

    return (
        <Tooltip content="Code Assistant chat">
            <Button view="outlined-action" size="l" onClick={handleToggle}>
                <Icon data={AiIcon} size={16} /> Ask AI
            </Button>
        </Tooltip>
    );
};
