import React, {FC} from 'react';
import {useDispatch} from 'react-redux';
import {Button, Icon, Tooltip} from '@gravity-ui/uikit';
import AiIcon from '../../assets/img/svg/icons/ai-assistant.svg';
import {setIsOpen, setQuestion} from '../../store/reducers/ai/chatSlice';
import {sendQuestion} from '../../store/actions/ai/chat';

const QUERY_ERROR_PROMPT = 'Как решить проблему?';

export const AskAIErrorButton: FC = () => {
    const dispatch = useDispatch();

    const handleToggle = () => {
        dispatch(setQuestion(QUERY_ERROR_PROMPT));
        dispatch(setIsOpen(true));
        dispatch(sendQuestion());
    };

    return (
        <Tooltip content="Ask Code Assistant why the query failed">
            <Button view="outlined-action" onClick={handleToggle}>
                <Icon data={AiIcon} size={16} /> AI help
            </Button>
        </Tooltip>
    );
};
