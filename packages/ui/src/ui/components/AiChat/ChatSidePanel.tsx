import React, {FC, useEffect} from 'react';
import {useSidePanel} from '../../hooks/use-side-panel';
import withLazyLoading from '../../hocs/withLazyLoading';
import {useSelector} from '../../store/redux-hooks';
import {selectAiChatConfigured, selectChatOpen} from '../../store/selectors/ai/chat';

const ChatLazy = withLazyLoading(
    React.lazy(() => import(/* webpackChunkName: 'code-assistant-chat' */ './Chat')),
);

export const ChatSidePanel: FC = () => {
    const open = useSelector(selectChatOpen);
    const isConfigured = useSelector(selectAiChatConfigured);

    const {widgetContent, openWidget, closeWidget} = useSidePanel('chat', {
        renderContent: () => <ChatLazy />,
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
