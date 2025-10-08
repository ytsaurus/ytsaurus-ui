import {Request} from '@gravity-ui/expresskit';
import {CodeAssistantTelemetry} from '../shared/suggestApi';

// Code Assistant API proto
// https://a.yandex-team.ru/arcadia/dj/services/code_assist/recommender_server/lib/proto/chat.proto?rev=r16856612#L116

export interface SuggestApi {
    getQuerySuggestions(
        req: Request,
        queryData: QuerySuggestionsData,
    ): Promise<{items: string[]; requestId: string}>;
    sendTelemetry(req: Request, telemetryData: CodeAssistantTelemetry): Promise<void>;
}

export type QuerySuggestionsData = {
    requestId: string;
    contextId: string;
    query: string;
    line: string;
    column: string;
    engine: string;
};

export type ChatData = {
    requestId: string;
    question: string;
    history: HistoryMessage[];
    query: string;
    problems: string;
};

export type StreamData = {
    id: string;
    offset: number;
};

export type IdeInfo = {
    Ide: string;
    IdeVersion: string;
    PluginFamily: string;
    PluginVersion: string;
};

export type HistoryMessage = {
    Content: string;
    IsQuestion: boolean;
    Reaction: Reaction;
    Timestamp: number;
};

export type TelemetryData = {
    requestId: string;
    event: ChatTelemetry;
};

type ChatTelemetryBody = {
    RequestId: string;
    Timestamp: number;
};

type Range = {
    Content?: string;
    StartLine?: number;
    EndLine?: number;
};

type TextFileContent = {
    Path?: string;
    Ranges: Range[];
};

export type ChatTelemetryCopy = {Copy: {Content: string}} & ChatTelemetryBody;
export type ChatTelemetryReaction = {Reaction: {Kind: Reaction}} & ChatTelemetryBody;
export type ChatTelemetry = ChatTelemetryCopy | ChatTelemetryReaction;

export interface AiChat {
    RequestId: string;
    SessionId?: string;
    Question: string;
    OpenedTabs?: string;
    TabsHistory?: string;
    ChatHistory?: HistoryMessage[];
    IdeInfo?: IdeInfo;
    Streaming?: boolean;
    AddReferencesSnippet?: boolean;
    UserContext: {
        Intrasearch?: {
            IsUse: boolean;
        };
        ActiveFile?: TextFileContent;
        Problems?: string[];
    };
}

export interface ChatStreamingRequest {
    GenerativeTaskId: string;
    OutputOffset: number;
}

export interface ChatStreamingResponse {
    State: StreamState;
    Answer: string;
    NextOffset: number;
}

export interface Reference {
    Url: string;
    Title: string;
    Relevance: number;
}

export interface InitialChatAnswer {
    RequestId: string;
    GenerativeTaskId: string;
    References: Reference[];
    PeopleReferences: Reference[];
}

export interface Prompt {
    Files: PromptFile[];
    ContextCreateType: 1;
    ForceSuggest?: boolean;
    IdeInfo: IdeInfo;
    RequestId: string;
}

export interface PromptPosition {
    Ln: number;
    Col: number;
}

export interface PromptFragment {
    Text: string;
    Start: PromptPosition;
    End: PromptPosition;
}

export interface PromptFile {
    Path: string;
    Fragments: PromptFragment[];
    Cursor: PromptPosition;
}

export interface Suggestions {
    Suggests: Suggestion[];
    RequestId: string;
}

export interface Suggestion {
    Text: string;
}

export enum Reaction {
    Like = 1,
    Dislike = 2,
    Ignore = 3,
}

export enum StreamState {
    Progress = 'EST_InProgress',
    Finished = 'EST_Finished',
    Failed = 'EST_Failed',
    NotFound = 'EST_NotFound',
    Unknown = 'EST_Unknown',
}
