import {useEffect, useRef, useState} from 'react';
import {type ChatStatus, type TChatMessage, type TSubmitData} from '@gravity-ui/aikit';
import {type OpenAIStreamSource, useOpenAIStreamAdapter} from '@gravity-ui/aikit/adapters';
import {v4 as uuidv4} from 'uuid';
import {useDispatch, useSelector} from '../../../store/redux-hooks';
import {requestConversationTitleUpdate, sendQuestion} from '../../../store/actions/ai/chat';
import {
    addConversationItem,
    addConversationItems,
    clearAttachedFiles,
    setSending,
} from '../../../store/reducers/ai/chatSlice';
import {selectChatSending, selectConversation} from '../../../store/selectors/ai/chat';
import i18n from '../i18n';

const CHAT_RESPONSE_TIMEOUT_MS = 5 * 60_000;

type ChatRequest = {
    messages: TChatMessage[];
    status: ChatStatus;
    onCancel: () => Promise<void>;
    onSend: (data: TSubmitData) => Promise<void | false>;
};

export function useChatRequest(): ChatRequest {
    const dispatch = useDispatch();
    const conversation = useSelector(selectConversation);
    const sending = useSelector(selectChatSending);
    const [stream, setStream] = useState<{source: OpenAIStreamSource; id: string} | null>(null);
    const [completed, setCompleted] = useState<TChatMessage[] | null>(null);
    const request = useRef<AbortController>();
    const adapter = useOpenAIStreamAdapter(stream?.source || null, {
        assistantMessageId: stream?.id || 'idle',
        onStreamEnd: setCompleted,
    });

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
                    error: request.current?.signal.aborted
                        ? request.current.signal.reason
                        : adapter.error,
                    actions: [],
                }),
            );
        } else {
            dispatch(clearAttachedFiles());
            dispatch(requestConversationTitleUpdate());
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
        // One deadline covers preparation, response headers, and the entire stream.
        const timeout = setTimeout(() => {
            controller.abort(new Error(i18n('alert_response-timeout')));
        }, CHAT_RESPONSE_TIMEOUT_MS);
        controller.signal.addEventListener('abort', () => clearTimeout(timeout), {once: true});
        try {
            const response = await dispatch(
                sendQuestion({message: content, signal: controller.signal}),
            );
            if (!response) {
                controller.abort();
                request.current = undefined;
                return false;
            }
            if (request.current !== controller) return false;
            controller.signal.throwIfAborted();
            setStream({source: response, id: uuidv4()});
        } catch (error) {
            const requestError = controller.signal.aborted ? controller.signal.reason : error;
            controller.abort();
            if (request.current !== controller) return false;
            dispatch(
                addConversationItem({
                    id: uuidv4(),
                    role: 'assistant',
                    content: {type: 'text', data: {text: ''}},
                    error:
                        requestError instanceof Error
                            ? requestError
                            : new Error(String(requestError)),
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

    return {messages, status, onSend, onCancel};
}
