import React, {createContext, useContext, useEffect, useRef, useState} from 'react';
import {type ChatStatus, type TChatMessage, type TSubmitData} from '@gravity-ui/aikit';
import {type OpenAIStreamSource, useOpenAIStreamAdapter} from '@gravity-ui/aikit/adapters';
import {v4 as uuidv4} from 'uuid';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {sendQuestion, summarizeConversationTitle} from '../../../store/actions/ai/chat';
import {
    addConversationItem,
    addConversationItems,
    clearAttachedFiles,
    setSending,
} from '../../../store/reducers/ai/chatSlice';
import {
    selectChatSending,
    selectConversation,
    selectConversations,
} from '../../../store/selectors/ai/chat';
import {toaster} from '../../../utils/toaster';
import {showErrorPopup} from '../../../utils/utils';
import utilsI18n from '../../../utils/i18n';
import i18n from '../i18n';
import {responseEvents} from '../stream';

type ChatController = {
    messages: TChatMessage[];
    status: ChatStatus;
    onCancel: () => Promise<void>;
    onSend: (data: TSubmitData) => Promise<void | false>;
};
const Context = createContext<ChatController | undefined>(undefined);

export function useChatController() {
    const controller = useContext(Context);
    if (!controller) throw new Error('ChatProvider is required');
    return controller;
}

type ChatProviderProps = {children?: React.ReactNode};

export default function ChatProvider({children}: ChatProviderProps) {
    const dispatch = useDispatch();
    const conversation = useSelector(selectConversation);
    const sending = useSelector(selectChatSending);
    const {error: historyError} = useSelector(selectConversations);
    const [stream, setStream] = useState<{source: OpenAIStreamSource; id: string} | null>(null);
    const [completed, setCompleted] = useState<TChatMessage[] | null>(null);
    const request = useRef<AbortController>();
    const adapter = useOpenAIStreamAdapter(stream?.source || null, {
        assistantMessageId: stream?.id || 'idle',
        onStreamEnd: setCompleted,
    });

    useEffect(() => {
        if (!historyError) return;
        toaster.add({
            name: 'ai-chat-history-error',
            theme: 'danger',
            title: i18n('title_chat'),
            content: historyError.message,
            actions: [
                {
                    label: utilsI18n('action_details'),
                    onClick: () => showErrorPopup(historyError),
                },
            ],
        });
    }, [historyError]);

    useEffect(
        () => () => {
            if (request.current) {
                request.current.abort();
                request.current = undefined;
                dispatch(setSending(false));
            }
        },
        [dispatch],
    );

    useEffect(() => {
        if (!completed) return;
        dispatch(addConversationItems(completed));
        if (adapter.error) {
            dispatch(
                addConversationItem({
                    id: uuidv4(),
                    role: 'assistant',
                    content: {type: 'text', data: {text: ''}},
                    error: adapter.error,
                    actions: [],
                }),
            );
        } else {
            dispatch(clearAttachedFiles());
            dispatch(summarizeConversationTitle());
        }
        dispatch(setSending(false));
        request.current?.abort();
        request.current = undefined;
        setStream(null);
        setCompleted(null);
    }, [completed, adapter.error, dispatch]);

    const onSend = async ({content}: TSubmitData): Promise<void | false> => {
        if (request.current) return false;
        const controller = new AbortController();
        request.current = controller;
        try {
            const response = await dispatch(
                sendQuestion({message: content, signal: controller.signal}),
            );
            if (!response) {
                request.current = undefined;
                return false;
            }
            if (request.current !== controller) return false;
            controller.signal.throwIfAborted();
            setStream({source: responseEvents(response, controller), id: uuidv4()});
        } catch (error) {
            if (request.current !== controller) return false;
            dispatch(
                addConversationItem({
                    id: uuidv4(),
                    role: 'assistant',
                    content: {type: 'text', data: {text: ''}},
                    error: error instanceof Error ? error : new Error(String(error)),
                    actions: [],
                }),
            );
            dispatch(setSending(false));
            request.current = undefined;
            return false;
        }
    };

    const onCancel = async () => {
        request.current?.abort(new Error(i18n('alert_response-interrupted')));
    };

    let status: ChatStatus = 'ready';
    if (sending) status = stream ? adapter.status : 'streaming_loading';

    // Redux can publish the completed response before the stream state is cleared.
    // The adapter also retains its previous messages until the next stream starts.
    const savedMessageIds = new Set(conversation.items.map(({id}) => id));
    const messages = stream
        ? [...conversation.items, ...adapter.messages.filter(({id}) => !savedMessageIds.has(id))]
        : conversation.items;

    return (
        <Context.Provider
            value={{
                messages,
                status,
                onSend,
                onCancel,
            }}
        >
            {children}
        </Context.Provider>
    );
}
