import {ThunkAction} from 'redux-thunk';
import {Action} from 'redux';
import {RootState} from '../../reducers';
import {selectChatHistory, selectChatOpen, selectChatQuestion} from '../../selectors/ai/chat';
import {
    ChatAnswer,
    ChatError,
    ChatQuestion,
    addHistoryItem,
    setHistory,
    setIsOpen,
    setLoading,
    setQuestion,
} from '../../reducers/ai/chatSlice';
import axios from 'axios';
import {
    ChatStreamingResponse,
    ChatTelemetryCopy,
    ChatTelemetryReaction,
    HistoryMessage,
    InitialChatAnswer,
    Reaction,
    StreamState,
} from '../../../../shared/ai-chat';
import {getQueryItem, getQueryText} from '../../selectors/query-tracker/query';

const BASE_PATH = '/api/code-assistant';
const STREAM_DELAY = 200;
type AsyncAction = ThunkAction<void, RootState, undefined, Action>;

export const getChatStream =
    (taskId: string, offset: number): AsyncAction =>
    async (dispatch, getState) => {
        const history = selectChatHistory(getState());
        const index = history.findIndex((item) => item.type === 'answer' && item.taskId === taskId);

        if (index < 0) return;
        const oldAnswer = history[index] as ChatAnswer;

        try {
            const {data} = await axios.post<ChatStreamingResponse>(`${BASE_PATH}/streaming`, {
                id: taskId,
                offset,
            });

            const newHistory = [...history];
            newHistory[index] = {
                ...oldAnswer,
                value: oldAnswer.value + (data.Answer || ''),
                state: data.State,
            };
            dispatch(setHistory(newHistory));

            if (data.State === StreamState.Progress || data.State === StreamState.NotFound) {
                setTimeout(() => {
                    dispatch(getChatStream(taskId, data.NextOffset));
                }, STREAM_DELAY);
            }

            if (data.State === StreamState.Failed || data.State === StreamState.Unknown) {
                throw new Error('Stream error');
            }

            if (data.State === StreamState.Finished) {
                dispatch(setLoading(false));
            }
        } catch (e) {
            const error: ChatError = {
                type: 'error',
                error: e as Error,
                timestamp: Date.now(),
            };
            dispatch(addHistoryItem(error));
            dispatch(setLoading(false));
        }
    };

export const sendQuestion = (): AsyncAction => async (dispatch, getState) => {
    const state = getState();
    const question = selectChatQuestion(state);
    const history = selectChatHistory(state);
    const query = getQueryText(state);
    const timestamp = Date.now();
    const error = getQueryItem(state)?.error;

    if (!question) return;

    const deadline = timestamp - 15 * 60 * 1000; // 15 min
    // create chat history for code assistant
    const chatContext = history.reduce<HistoryMessage[]>((acc, historyItem) => {
        if (
            historyItem.timestamp > deadline &&
            (historyItem.type === 'question' || historyItem.type === 'answer')
        ) {
            acc.push({
                Content: historyItem.value,
                Timestamp: historyItem.timestamp,
                IsQuestion: historyItem.type === 'question',
                Reaction: 3,
            });
        }
        return acc;
    }, []);

    // add question in chat
    const questionItem: ChatQuestion = {type: 'question', value: question, timestamp};
    dispatch(addHistoryItem(questionItem));

    // clear input
    dispatch(setQuestion(''));
    dispatch(setLoading(true));

    try {
        const {data} = await axios.post<InitialChatAnswer>(`${BASE_PATH}/chat`, {
            question,
            history: chatContext,
            query,
            problems: error ? JSON.stringify(error) : '',
        });

        const answer: ChatAnswer = {
            type: 'answer',
            taskId: data.GenerativeTaskId,
            state: StreamState.Progress,
            requestId: data.RequestId,
            value: '',
            timestamp: Date.now(),
            reference: data.References,
            peopleReferences: data.PeopleReferences,
            reaction: Reaction.Ignore,
        };
        dispatch(addHistoryItem(answer));
        dispatch(getChatStream(answer.taskId, 0));
    } catch (e) {
        const error: ChatError = {
            type: 'error',
            error: e as Error,
            timestamp: Date.now(),
        };
        dispatch(addHistoryItem(error));
        dispatch(setLoading(false));
    }
};

export const sendReactionTelemetry =
    (timestamp: number, reaction: Reaction): AsyncAction =>
    async (dispatch, getState) => {
        const state = getState();
        const history = selectChatHistory(state);

        const index = history.findIndex(
            (item) => item.timestamp === timestamp && item.type === 'answer',
        );

        if (index < 0) return;
        const newHistory = [...history] as ChatAnswer[];
        const oldAnswer = newHistory[index];

        const newReaction = reaction === oldAnswer.reaction ? Reaction.Ignore : reaction;
        newHistory[index] = {...oldAnswer, reaction: newReaction};

        dispatch(setHistory(newHistory));

        const event: ChatTelemetryReaction = {
            RequestId: oldAnswer.requestId,
            Timestamp: oldAnswer.timestamp,
            Reaction: {Kind: newReaction},
        };

        try {
            await axios.post(`${BASE_PATH}/telemetry`, {event});
        } catch (e) {
            const error: ChatError = {
                type: 'error',
                error: e as Error,
                timestamp: Date.now(),
            };
            dispatch(addHistoryItem(error));
        }
    };

export const sendCopyTelemetry =
    (content: string, timestamp: number): AsyncAction =>
    async (dispatch, getState) => {
        const history = selectChatHistory(getState());
        const answer = history.find((item) => item.timestamp === timestamp) as
            | ChatAnswer
            | undefined;

        if (!answer) return;

        const event: ChatTelemetryCopy = {
            RequestId: answer.requestId,
            Timestamp: answer.timestamp,
            Copy: {Content: content},
        };

        try {
            await axios.post(`${BASE_PATH}/telemetry`, {event});
        } catch (e) {
            const error: ChatError = {
                type: 'error',
                error: e as Error,
                timestamp: Date.now(),
            };
            dispatch(addHistoryItem(error));
        }
    };

export const toggleChatSidePanel = (): AsyncAction => (dispatch, getState) => {
    const open = selectChatOpen(getState());
    dispatch(setIsOpen(!open));
};
