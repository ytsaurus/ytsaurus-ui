import React, {type FC, useCallback, useEffect} from 'react';
import {useSidePanel} from '../../hooks/use-side-panel';
import withLazyLoading from '../../hocs/withLazyLoading';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {selectAiChatConfigured, selectChatOpen} from '../../store/selectors/ai/chat';
import {setIsOpen} from '../../store/reducers/ai/chatSlice';
import uiFactory from '../../UIFactory';
import {useMonaco} from '../../pages/query-tracker/hooks/useMonaco';
import {insertTextWhereCursor} from '../../pages/query-tracker/Navigation/helpers/insertTextWhereCursor';

const ChatLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: 'code-assistant-chat' */ './Chat')),
);

export const ChatSidePanel: FC = () => {
    const dispatch = useDispatch();
    const open = useSelector(selectChatOpen);
    const isConfigured = useSelector(selectAiChatConfigured);
    const {getEditor} = useMonaco();

    const handleClose = useCallback(() => {
        dispatch(setIsOpen(false));
    }, [dispatch]);

    const handlePasteCode = useCallback(
        (code: string) => {
            const editor = getEditor('queryEditor');
            if (!editor || !code) return;

            insertTextWhereCursor(code, editor);
        },
        [getEditor],
    );

    const {widgetContent, openWidget, closeWidget} = useSidePanel('chat', {
        renderContent: ({visible}) => {
            const externalAiChat = uiFactory.getExternalAiChat();
            return externalAiChat ? (
                <externalAiChat.Chat
                    visible={visible}
                    onClose={handleClose}
                    onPasteCode={handlePasteCode}
                />
            ) : (
                <ChatLazy />
            );
        },
    });

    useEffect(() => {
        if (!isConfigured) {
            return;
        }
        const action = open ? openWidget : closeWidget;
        action();
    }, [closeWidget, open, openWidget, isConfigured]);

    if (!isConfigured) {
        return null;
    }

    return widgetContent;
};
