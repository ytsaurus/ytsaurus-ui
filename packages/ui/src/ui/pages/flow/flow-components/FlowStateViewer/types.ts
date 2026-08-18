import type {
    FlowDeleteStatesResponse,
    FlowKeyColumn,
    FlowReadStatesResponse,
    FlowStateTarget,
    GetPipelineStateData,
} from '../../../../../shared/yt-types';

export type FlowStateNameInputMode = 'declared-only' | 'suggested' | 'free-form';

export type FlowStateFiltersValue = {
    computationId?: string;
    partitionId?: string;
    keyValues: Record<string, string>;
    stateName?: string;
    target: FlowStateTarget;
    limit: number;
};

export type FlowStateValidationErrorKey =
    | 'validation_empty-key-value'
    | 'validation_expects-integer'
    | 'validation_integer-out-of-range'
    | 'validation_expects-number'
    | 'validation_expects-boolean'
    | 'validation_fill-all-keys'
    | 'validation_key-target-mismatch'
    | 'validation_no-scope';

export type FlowStateValidationError = {
    errorKey: FlowStateValidationErrorKey;
    params?: Record<string, string>;
};

export type FlowRowDeleteOutcome = {
    rowId: string;
    response?: FlowDeleteStatesResponse;
    error?: unknown;
};

export type FlowStateResultSection =
    | 'key_state'
    | 'partition_state'
    | 'external_key_state'
    | 'joined_external_key_state';

export type FlowStateResultRow = {
    section: FlowStateResultSection;
    computationId?: string;
    partitionId?: string;
    key?: unknown;
    stateName: string;
    value: unknown;
};

export type FlowStateReadState = {
    revision: number;
    requestId: number;
    loadingRequestId?: number;
    response?: FlowReadStatesResponse;
    error?: unknown;
};

export type FlowStateReadEvent =
    | {type: 'filters-changed'; hasScope: boolean; requestId: number}
    | {type: 'load-started'; requestId: number}
    | {type: 'load-succeeded'; requestId: number; response: FlowReadStatesResponse}
    | {type: 'load-failed'; requestId: number; error: unknown};

export type FlowDeleteDialogSnapshot = {bodyKey: string; force: boolean};

export type FlowDeleteDialogState = {
    session: number;
    force: boolean;
    busy?: 'state' | 'preview' | 'delete';
    pipelineState?: GetPipelineStateData;
    preview?: Array<FlowRowDeleteOutcome>;
    previewSnapshot?: FlowDeleteDialogSnapshot;
    committed?: Array<FlowRowDeleteOutcome>;
    failed?: Array<FlowRowDeleteOutcome>;
    error?: unknown;
};

export type FlowDeleteDialogEvent =
    | {type: 'opened'; session: number}
    | {type: 'closed'; session: number}
    | {type: 'force-changed'; force: boolean}
    | {type: 'run-started'; commit: boolean}
    | {type: 'pipeline-state-loaded'; session: number; pipelineState: GetPipelineStateData}
    | {
          type: 'preview-loaded';
          session: number;
          outcomes: Array<FlowRowDeleteOutcome>;
          snapshot: FlowDeleteDialogSnapshot;
      }
    | {
          type: 'delete-finished';
          session: number;
          outcomes: Array<FlowRowDeleteOutcome>;
          expected: number;
      }
    | {type: 'request-failed'; session: number; error: unknown};

export type FlowPipelineSpecData = {spec?: unknown};

export type FlowKeySchemaResolution = {
    keyColumns: Array<FlowKeyColumn>;
    allKeyColumns: Array<FlowKeyColumn>;
    overrideActive: boolean;
};

export type FlowRowKeySchema = {
    keyColumns: Array<FlowKeyColumn>;
    allKeyColumns: Array<FlowKeyColumn>;
    keySchemaStateName?: string;
};

export type FlowStateRowFilterField = 'target' | 'computation' | 'key' | 'stateName';
export type FlowStateStorageLocation = {path: string; cluster?: string};

export type FlowHeavyHitterEntry = {keyText: string; ratio: number; partitionId: string};
export type FlowHeavyHittersMessageData = {
    title: string;
    entries: Array<FlowHeavyHitterEntry>;
    unparsedEntries: Array<string>;
};
export type FlowHeavyHitterStateSeed = {
    keyValues?: Record<string, string>;
    partitionId?: string;
};

export type FlowStateCellHandlers = {
    getRowFilterUpdate: (
        row: FlowStateResultRow,
        field: FlowStateRowFilterField,
    ) => FlowStateFiltersValue | undefined;
    onFiltersChange: (next: FlowStateFiltersValue) => void;
    resolveStoragePath: (row: FlowStateResultRow) => FlowStateStorageLocation | undefined;
    resolveComputationLink: (computationId: string) => string;
};
