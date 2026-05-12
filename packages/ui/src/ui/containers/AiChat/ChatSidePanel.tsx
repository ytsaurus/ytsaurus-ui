import React, {type FC, useCallback, useEffect} from 'react';
import {useSidePanel} from '../../hooks/use-side-panel';
import {useDispatch, useSelector} from '../../store/redux-hooks';
import {
    selectAiChatConfigured,
    selectChatOpen,
    selectPageContext,
} from '../../store/selectors/ai/chat';
import {setIsOpen} from '../../store/reducers/ai/chatSlice';
import uiFactory from '../../UIFactory';
import {useMonaco} from '../../pages/query-tracker/hooks/useMonaco';
import {YT} from '../../config/yt-config';

export const ChatSidePanel: FC = () => {
    const dispatch = useDispatch();
    const open = useSelector(selectChatOpen);
    const isConfigured = useSelector(selectAiChatConfigured);
    const {getEditor} = useMonaco();
    const isLocalMode = Boolean(YT.isLocalCluster);
    const pageContext = useSelector(selectPageContext);

    const handleClose = useCallback(() => {
        dispatch(setIsOpen(false));
    }, [dispatch]);

    const handlePasteCode = useCallback(
        async (code: string) => {
            const editor = getEditor('queryEditor');
            if (!editor || !code) return;

            const {insertTextWhereCursor} = await import(
                /* webpackChunkName: 'code-assistant-chat' */
                '../../pages/query-tracker/Navigation/helpers/insertTextWhereCursor'
            );
            insertTextWhereCursor(code, editor);
        },
        [getEditor],
    );

    const {widgetContent, openWidget, closeWidget} = useSidePanel('chat', {
        renderContent: () => {
            const {Chat} = uiFactory.getAiChat();
            return (
                <Chat
                    onClose={handleClose}
                    pageContext={pageContext}
                    onPasteCode={handlePasteCode}
                />
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

    if (!isConfigured || isLocalMode) {
        return null;
    }

    return widgetContent;
};
