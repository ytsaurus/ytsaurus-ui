export type ChatQuestion = {
    type: 'question';
    id: string;
    value: string;
};

export type ChatAnswer = {
    type: 'answer';
    id: string;
    state: 'progress' | 'done';
    value: string;
};

export type SearchMcpAnswer = {
    type: 'mcp_search_answer';
    id: string;
    value: {
        full_text: string;
        title: string;
        url: string;
    }[];
};

export type TableSchemaMcpAnswer = {
    type: 'mcp_table_schema_answer';
    id: string;
    value: string;
};

export type UnknownMcpAnswer = {
    type: 'mcp_unknown_answer';
    id: string;
    name: string;
    value: any;
};

export type ChatError = {
    type: 'error';
    error: Error;
};

export type ChatMessage =
    | ChatQuestion
    | SearchMcpAnswer
    | TableSchemaMcpAnswer
    | UnknownMcpAnswer
    | ChatAnswer
    | ChatError;

export type SearchMcpResponse = {
    response: {
        result?: {
            full_text: string;
            title: string;
            url: string;
        }[];
    };
};
