export type AcceptedCodeAssistantTelemetry = {
    Accepted: {
        RequestId: string;
        Timestamp: number;
        AcceptedText: string;
        ConvertedText: string;
    };
};

export type DiscardedCodeAssistantTelemetry = {
    Discarded: {
        RequestId: string;
        Timestamp: number;
        DiscardReason: string;
        DiscardedText: string;
    };
};

export type IgnoredCodeAssistantTelemetry = {
    Ignored: {
        RequestId: string;
        Timestamp: number;
        IgnoredText: string;
    };
};

export type SettingsCodeAssistantTelemetry = {
    Settings: {
        IdeInfo: {
            Ide: 'query_tracker';
            IdeVersion: string;
            PluginFamily: 'query_tracker';
            PluginVersion: string;
        };
        Fields: {
            apiType: string;
            telemetryEnabled: '1' | '0';
        };
    };
};

export type CodeAssistantTelemetry =
    | AcceptedCodeAssistantTelemetry
    | DiscardedCodeAssistantTelemetry
    | IgnoredCodeAssistantTelemetry
    | SettingsCodeAssistantTelemetry;
