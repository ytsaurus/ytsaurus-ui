import React, {FC} from 'react';
import {FooterItem} from '@gravity-ui/navigation';
import AiIcon from '../../../assets/img/svg/icons/ai-chat-icon.svg';
import i18n from './i18n';
import {useChatToggle} from './useChatToggle';
import {useSelector} from '../../../store/redux-hooks';
import {selectShowAiChat} from '../../../store/selectors/settings/settings-development';

type Props = {
    compact: boolean;
};

export const ChatToggleFooterButton: FC<Props> = ({compact}) => {
    const {isConfigured, toggle} = useChatToggle();
    const showAiChat = useSelector(selectShowAiChat);

    if (!isConfigured || !showAiChat) return null;

    return (
        <FooterItem
            key="ai-chat"
            compact={compact}
            item={{
                id: 'ai-chat',
                title: i18n('context_tooltip'),
                icon: AiIcon,
                onItemClick: toggle,
            }}
        />
    );
};
