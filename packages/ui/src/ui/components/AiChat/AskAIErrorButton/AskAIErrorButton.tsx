import React, {FC} from 'react';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import AiIcon from '../../../assets/img/svg/icons/ai-chat-icon.svg';
import {createConversationWithPrompt} from '../../../store/actions/ai/chat';
import {selectAiChatConfigured} from '../../../store/selectors/ai/chat';
import i18n from './i18n';

export const AskAIErrorButton: FC = () => {
    const dispatch = useDispatch();
    const isConfigured = useSelector(selectAiChatConfigured);

    if (!isConfigured) {
        return null;
    }

    const handleToggle = () => {
        dispatch(createConversationWithPrompt(i18n('question_default')));
    };

    return (
        <Tooltip content={i18n('context_tooltip')}>
            <Button view="outlined-utility" onClick={handleToggle}>
                <Icon data={AiIcon} size={16} /> {i18n('action_button')}
            </Button>
        </Tooltip>
    );
};
