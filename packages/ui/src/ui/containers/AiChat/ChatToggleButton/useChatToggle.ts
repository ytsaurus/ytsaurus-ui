import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {selectAiChatConfigured} from '../../../store/selectors/ai/chat';
import {toggleChatSidePanel} from '../../../store/actions/ai/chat';

export const useChatToggle = () => {
    const dispatch = useDispatch();
    const isConfigured = useSelector(selectAiChatConfigured);

    const handleToggle = () => {
        dispatch(toggleChatSidePanel());
    };

    return {
        isConfigured,
        toggle: handleToggle,
    };
};
