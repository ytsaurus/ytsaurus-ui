import React, {FC} from 'react';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import AiIcon from '../../../assets/img/svg/icons/ai-chat-icon.svg';
import i18n from './i18n';
import {useChatToggle} from './useChatToggle';

type Props = {
    hideText?: boolean;
};

export const ChatToggleButton: FC<Props> = ({hideText}) => {
    const {isConfigured, toggle} = useChatToggle();

    if (!isConfigured) return null;

    return (
        <Tooltip content={i18n('context_tooltip')}>
            <Button view="outlined-utility" size="l" onClick={toggle}>
                <Icon data={AiIcon} size={16} />
                {!hideText && i18n('action_button')}
            </Button>
        </Tooltip>
    );
};
