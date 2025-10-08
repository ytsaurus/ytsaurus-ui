import axios from 'axios';
import {CodeAssistantTelemetry} from '../../shared/suggestApi';
import {Request} from '@gravity-ui/expresskit';
import {
    AiChat as AiChatType,
    ChatData,
    ChatStreamingRequest,
    ChatStreamingResponse,
    IdeInfo,
    InitialChatAnswer,
    Prompt,
    PromptFile,
    QuerySuggestionsData,
    StreamData,
    SuggestApi,
    Suggestions,
    TelemetryData,
} from '../../shared/ai-chat';
// import {getTvmAuthHeaders} from '../../../server/_yandex-team/tvm';

const limitBeforeCursor = 8000;
const limitAfterCursor = 1000;

const defaultIdeInfo: IdeInfo = {
    Ide: 'query_tracker',
    IdeVersion: '1.1',
    PluginFamily: 'query_tracker',
    PluginVersion: '0.1.7',
};

export class AiChat implements SuggestApi {
    private baseUrl = '';

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    getRequestHeaders(req: Request) {
        // const {uid} = req || {};
        console.log(req);

        return {
            // ...getTvmAuthHeaders(req, 'codeAssist'),
            uid: 'qwe',
        };
    }

    async sendQuestion(req: Request, chatData: ChatData): Promise<InitialChatAnswer> {
        const {requestId, question, query, history, problems} = chatData;

        const data: AiChatType = {
            IdeInfo: defaultIdeInfo,
            RequestId: requestId,
            Question: question,
            ChatHistory: history,
            UserContext: {
                ActiveFile: {
                    Path: '/query_tracker',
                    Ranges: [
                        {
                            Content: query,
                        },
                    ],
                },
                Problems: [problems],
            },
            Streaming: true,
        };

        try {
            const response = await axios.request<InitialChatAnswer>({
                url: '/code_chat?service=qt',
                baseURL: this.baseUrl,
                method: 'POST',
                data,
                headers: this.getRequestHeaders(req),
            });

            return response.data;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async getChatStreaming(req: Request, streamingData: StreamData): Promise<any> {
        const data: ChatStreamingRequest = {
            GenerativeTaskId: streamingData.id,
            OutputOffset: streamingData.offset,
        };

        try {
            const response = await axios.request<ChatStreamingResponse>({
                url: '/code_chat_stream',
                baseURL: this.baseUrl,
                method: 'POST',
                data,
                headers: this.getRequestHeaders(req),
            });

            return response.data;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async sendChatTelemetry(req: Request, telemetryData: TelemetryData): Promise<void> {
        const {requestId, event} = telemetryData;

        try {
            const response = await axios.request({
                url: '/code_chat?service=qt',
                baseURL: this.baseUrl,
                method: 'POST',
                data: {
                    RequestId: requestId,
                    Events: [event],
                },
                headers: this.getRequestHeaders(req),
            });

            return response.data;
        } catch (e) {
            return Promise.reject(e);
        }
    }

    async getQuerySuggestions(
        req: Request,
        queryData: QuerySuggestionsData,
    ): Promise<{items: string[]; requestId: string}> {
        const {contextId, query, line, column, engine, requestId} = queryData;

        const data: Prompt = {
            IdeInfo: defaultIdeInfo,
            Files: this.getPromptFileContent({
                contextId,
                query,
                line: Number(line),
                column: Number(column),
                engine,
            }),
            ContextCreateType: 1,
            RequestId: requestId,
        };

        try {
            const response = await axios.request<Suggestions>({
                url: '/recommend',
                baseURL: this.baseUrl,
                method: 'POST',
                data,
                headers: this.getRequestHeaders(req),
            });

            return {
                items: response.data.Suggests.map((i) => i.Text),
                requestId,
            };
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async sendTelemetry(req: Request, telemetryData: CodeAssistantTelemetry): Promise<void> {
        try {
            await axios.request<Suggestions>({
                url: '/telemetry/completion',
                baseURL: this.baseUrl,
                method: 'POST',
                data: telemetryData,
                headers: this.getRequestHeaders(req),
            });
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private getPromptFileContent({
        contextId,
        query,
        line,
        column,
        engine,
    }: {
        contextId: string;
        query: string;
        line: number;
        column: number;
        engine: string;
    }): PromptFile[] {
        const lines = query.split('\n');
        if (lines.length === 0) {
            return [];
        }

        const prevTextInCurrentLine = lines[line - 1].slice(0, column - 1);
        const textAfterCursor = lines[line - 1].slice(column - 1);
        const prevText = lines
            .slice(0, line - 1)
            .concat([prevTextInCurrentLine])
            .join('\n');
        const postText = [textAfterCursor].concat(lines.slice(line)).join('\n');
        const cursorPosition = {Ln: line, Col: column};

        const fragments = [];
        if (prevText) {
            fragments.push({
                Text:
                    prevText.length > limitBeforeCursor
                        ? prevText.slice(prevText.length - limitBeforeCursor)
                        : prevText,
                Start: {Ln: 1, Col: 1},
                End: cursorPosition,
            });
        }
        if (postText) {
            fragments.push({
                Text: postText.slice(0, limitAfterCursor),
                Start: cursorPosition,
                End: {
                    Ln: lines.length,
                    Col: lines[lines.length - 1].length,
                },
            });
        }

        return fragments.length
            ? [
                  {
                      Fragments: fragments,
                      Cursor: cursorPosition,
                      Path: `${contextId}/query.${engine}`,
                  },
              ]
            : [];
    }
}
